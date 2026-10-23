/// <reference lib="webworker" />
// Runs pdf-lib off the main thread, so the page never freezes while counting
// pages or folding big PDFs (CLAUDE.md: heavy work in Web Workers).
import { countPages, mergePdfs, PdfError, splitPdf } from "../lib/pdf";
import type { PdfRequest, PdfResponse } from "../lib/pdf-worker-client";

declare const self: DedicatedWorkerGlobalScope;

self.addEventListener("message", async (event: MessageEvent<PdfRequest>) => {
  const request = event.data;
  const reply = (response: PdfResponse, transfer: Transferable[] = []) => self.postMessage(response, transfer);
  try {
    if (request.type === "count") {
      reply({ id: request.id, ok: true, pages: await countPages(request.bytes) });
    } else if (request.type === "merge") {
      const bytes = await mergePdfs(request.sources);
      // Hand the result back without copying it.
      reply({ id: request.id, ok: true, bytes }, [bytes.buffer]);
    } else {
      const parts = await splitPdf(request.bytes, request.groups);
      reply({ id: request.id, ok: true, parts }, parts.map((part) => part.buffer));
    }
  } catch (error) {
    const known = error instanceof PdfError;
    reply({
      id: request.id,
      ok: false,
      code: known ? error.code : "corrupted_pdf",
      message: known ? error.message : "This PDF could not be processed.",
    });
  }
});
