// Talks to src/workers/pdf.worker.ts. Each request gets an id so replies can
// be matched to the right promise, even with several requests in flight.
import { PdfError, type PdfErrorCode } from "./pdf-errors";

export type PdfRequest =
  | { id: number; type: "count"; bytes: ArrayBuffer }
  | { id: number; type: "merge"; sources: ArrayBuffer[] }
  | { id: number; type: "split"; bytes: ArrayBuffer; groups: number[][] };

export type PdfResponse =
  | { id: number; ok: true; pages: number }
  | { id: number; ok: true; bytes: Uint8Array }
  | { id: number; ok: true; parts: Uint8Array[] }
  | { id: number; ok: false; code: PdfErrorCode; message: string };

type Pending = { resolve: (response: PdfResponse) => void };

let worker: Worker | undefined;
let nextId = 1;
const pending = new Map<number, Pending>();

function getWorker(): Worker {
  if (worker) return worker;
  // Created on first use: visitors who only read the page never load pdf-lib.
  worker = new Worker(new URL("../workers/pdf.worker.ts", import.meta.url), { type: "module" });
  // One listener for the worker's whole life, attached only when it is created.
  worker.addEventListener("message", (event: MessageEvent<PdfResponse>) => {
    pending.get(event.data.id)?.resolve(event.data);
    pending.delete(event.data.id);
  });
  // A worker that cannot load never replies: fail every waiting request and drop
  // the worker so the next one starts a fresh one.
  worker.addEventListener("error", () => failAll("The folding table could not start. Check your connection and try again."));
  worker.addEventListener("messageerror", () => failAll("The folding table sent back something unreadable. Try again."));
  return worker;
}

function failAll(message: string): void {
  worker?.terminate();
  worker = undefined;
  for (const [id, { resolve }] of pending) resolve({ id, ok: false, code: "corrupted_pdf", message });
  pending.clear();
}

function send(request: PdfRequest, transfer: Transferable[]): Promise<PdfResponse> {
  return new Promise((resolve) => {
    pending.set(request.id, { resolve });
    // Transfer the buffers: the worker gets them without a copy.
    getWorker().postMessage(request, transfer);
  });
}

function unwrap(response: PdfResponse): PdfResponse & { ok: true } {
  if (!response.ok) throw new PdfError(response.code, response.message);
  return response;
}

export async function countPagesInWorker(bytes: ArrayBuffer): Promise<number> {
  const response = unwrap(await send({ id: nextId++, type: "count", bytes }, [bytes]));
  return "pages" in response ? response.pages : 0;
}

export async function mergeInWorker(sources: ArrayBuffer[]): Promise<Uint8Array> {
  const response = unwrap(await send({ id: nextId++, type: "merge", sources }, sources));
  if (!("bytes" in response)) throw new PdfError("corrupted_pdf", "The PDFs could not be folded.");
  return response.bytes;
}

/** Groups of 1-based page numbers -> one PDF per group (see splitPdf). */
export async function splitInWorker(bytes: ArrayBuffer, groups: number[][]): Promise<Uint8Array[]> {
  const response = unwrap(await send({ id: nextId++, type: "split", bytes, groups }, [bytes]));
  if (!("parts" in response)) throw new PdfError("corrupted_pdf", "The PDF could not be split.");
  return response.parts;
}
