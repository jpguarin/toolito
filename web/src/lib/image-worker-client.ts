// Talks to src/workers/image.worker.ts (same request/reply-by-id pattern as
// the PDF worker). The worker starts with the first image.
import type { ImageFormat, WashSettings } from "./image";

export type ImageRequest = { id: number; bytes: ArrayBuffer; input: ImageFormat; settings: WashSettings };

export type ImageResponse =
  | { id: number; ok: true; bytes: ArrayBuffer; format: ImageFormat; width: number; height: number }
  | { id: number; ok: false; message: string };

let worker: Worker | undefined;
let nextId = 1;
const pending = new Map<number, (response: ImageResponse) => void>();

function getWorker(): Worker {
  if (worker) return worker;
  worker = new Worker(new URL("../workers/image.worker.ts", import.meta.url), { type: "module" });
  worker.addEventListener("message", (event: MessageEvent<ImageResponse>) => {
    pending.get(event.data.id)?.(event.data);
    pending.delete(event.data.id);
  });
  // If the worker cannot load (a failed module or .wasm fetch), no reply will ever
  // come: fail every waiting request and drop the worker so the next one retries.
  worker.addEventListener("error", () => failAll("The washer could not start. Check your connection and try again."));
  worker.addEventListener("messageerror", () => failAll("The washer sent back something unreadable. Try again."));
  return worker;
}

function failAll(message: string): void {
  worker?.terminate();
  worker = undefined;
  for (const [id, resolve] of pending) resolve({ id, ok: false, message });
  pending.clear();
}

/** Wash one image in the worker. The input buffer is handed over, not copied. */
export function washInWorker(bytes: ArrayBuffer, input: ImageFormat, settings: WashSettings): Promise<ImageResponse> {
  const id = nextId++;
  return new Promise((resolve) => {
    pending.set(id, resolve);
    getWorker().postMessage({ id, bytes, input, settings } satisfies ImageRequest, [bytes]);
  });
}
