// The dryer's request to the API (docs/DRYER-FLOW.md §3).
// XMLHttpRequest instead of fetch ON PURPOSE: it is the only one that reports
// upload progress (xhr.upload.onprogress). Every other request uses fetch.
import { PUBLIC_API_URL } from "astro:env/client";

import { type Cycle, type DryerErrorCode, errorFromApi, networkError } from "./dryer";

export type DryerOutcome =
  | { ok: true; result: Blob; originalSize: number; compressedSize: number; alreadyOptimized: boolean }
  | { ok: false; code: DryerErrorCode; retryAfter?: number }
  | { ok: false; code: "aborted" };

const TIMEOUT_MS = 90_000; // 60 s on the server + room to upload and download.

/** §8: wake the Cloud Run container while the user picks a cycle. Fire and forget. */
export function warmUp(): void {
  fetch(`${PUBLIC_API_URL}/health`).catch(() => undefined);
}

/** 2xx: the PDF plus the sizes the API exposes through CORS (docs/API.md). */
export function readSuccess(blob: Blob, header: (name: string) => string | null): DryerOutcome {
  const originalSize = Number(header("X-Original-Size"));
  const compressedSize = Number(header("X-Compressed-Size"));
  return {
    ok: true,
    result: blob,
    originalSize: Number.isFinite(originalSize) && originalSize > 0 ? originalSize : blob.size,
    compressedSize: Number.isFinite(compressedSize) && compressedSize > 0 ? compressedSize : blob.size,
    alreadyOptimized: header("X-Already-Optimized") === "true",
  };
}

/** 4xx/5xx: the body is JSON ({"error": {"code", "message"}}) even with responseType "blob". */
export function readFailure(status: number, body: string, retryAfterHeader: string | null): DryerOutcome {
  let code: DryerErrorCode;
  try {
    code = errorFromApi(JSON.parse(body)?.error?.code);
  } catch {
    code = "internal_error";
  }
  if (status === 504) code = "processing_timeout"; // Cloud Run's own timeout has no JSON body.
  if (code !== "rate_limited") return { ok: false, code };
  const seconds = Number(retryAfterHeader);
  return { ok: false, code, retryAfter: Number.isFinite(seconds) && seconds > 0 ? seconds : 60 };
}

export interface DryerHandlers {
  onUploadProgress: (percent: number) => void;
  onUploadDone: () => void; // The drying stretch starts: no percentage from here on.
}

/** Send the PDF. The promise never rejects: every ending is a DryerOutcome. */
export function startDryer(file: File, level: Cycle, handlers: DryerHandlers): { outcome: Promise<DryerOutcome>; abort: () => void } {
  const xhr = new XMLHttpRequest();
  const outcome = new Promise<DryerOutcome>((resolve) => {
    xhr.open("POST", `${PUBLIC_API_URL}/v1/compress-pdf`);
    xhr.responseType = "blob";
    xhr.timeout = TIMEOUT_MS;

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) handlers.onUploadProgress(Math.round((event.loaded / event.total) * 100));
    };
    xhr.upload.onload = () => handlers.onUploadDone();

    xhr.onload = async () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(readSuccess(xhr.response as Blob, (name) => xhr.getResponseHeader(name)));
      } else {
        const body = xhr.response instanceof Blob ? await xhr.response.text() : "";
        resolve(readFailure(xhr.status, body, xhr.getResponseHeader("Retry-After")));
      }
    };
    // No response at all: offline, CORS refused (e.g. a 500 without CORS headers) or the server is down.
    xhr.onerror = () => resolve({ ok: false, code: networkError(navigator.onLine) });
    xhr.ontimeout = () => resolve({ ok: false, code: "processing_timeout" });
    xhr.onabort = () => resolve({ ok: false, code: "aborted" });

    const body = new FormData();
    body.append("file", file);
    body.append("level", level);
    xhr.send(body);
  });
  return { outcome, abort: () => xhr.abort() };
}
