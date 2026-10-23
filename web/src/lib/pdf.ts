// PDF tools that run in the browser (merge now, split later), built on pdf-lib.
// Keep every pdf-lib call in this file: switching to a fork means editing one file.
// Pure functions without DOM access, so they can move into a Web Worker.
import { PDFDocument } from "pdf-lib";

import { PdfError } from "./pdf-errors";

export { PdfError, type PdfErrorCode } from "./pdf-errors";

export type PdfBytes = ArrayBuffer | Uint8Array;

const PDF_MAGIC = "%PDF-"; // Every real PDF starts with these bytes.

function hasPdfHeader(bytes: PdfBytes): boolean {
  // A Uint8Array is already a view; an ArrayBuffer is raw memory and needs one.
  const view = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  return String.fromCharCode(...view.subarray(0, PDF_MAGIC.length)) === PDF_MAGIC;
}

/** Open a PDF, turning pdf-lib's failures into our error codes. */
async function openPdf(bytes: PdfBytes): Promise<PDFDocument> {
  if (!hasPdfHeader(bytes)) {
    throw new PdfError("not_a_pdf", "This file is not a PDF.");
  }

  let pdf: PDFDocument;
  try {
    // pdf-lib throws a generic Error for encrypted files, so let it load them
    // and ask isEncrypted ourselves instead of guessing from the error.
    pdf = await PDFDocument.load(bytes, { ignoreEncryption: true });
    // pdf-lib is lenient: garbage can "load" and only fail later, so touch
    // the page tree now, while we can still say "damaged".
    if (pdf.getPageCount() === 0) throw new Error("No pages");
  } catch {
    throw new PdfError("corrupted_pdf", "This PDF is damaged and cannot be opened.");
  }

  if (pdf.isEncrypted) {
    throw new PdfError("encrypted_pdf", "This PDF is password-protected. Remove the password and try again.");
  }
  return pdf;
}

export async function countPages(bytes: PdfBytes): Promise<number> {
  return (await openPdf(bytes)).getPageCount();
}

/** Stack the PDFs in the given order: the first one's pages come first. */
export async function mergePdfs(sources: PdfBytes[]): Promise<Uint8Array> {
  const merged = await PDFDocument.create();
  for (const bytes of sources) {
    const source = await openPdf(bytes);
    const pages = await merged.copyPages(source, source.getPageIndices());
    for (const page of pages) merged.addPage(page);
  }
  return merged.save();
}
