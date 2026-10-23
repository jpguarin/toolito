import { PDFDict, PDFDocument, PDFName } from "pdf-lib";
import { describe, expect, test } from "vitest";

import { countPages, mergePdfs, PdfError } from "./pdf";

/** A PDF with `pages` blank pages; each page width encodes its file and number. */
async function makePdf(pages: number, fileId: number): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  for (let n = 1; n <= pages; n++) pdf.addPage([100 * fileId + n, 200]);
  return pdf.save();
}

async function pageWidths(bytes: Uint8Array): Promise<number[]> {
  const pdf = await PDFDocument.load(bytes);
  return pdf.getPages().map((page) => page.getWidth());
}

async function expectPdfError(promise: Promise<unknown>, code: string): Promise<void> {
  await expect(promise).rejects.toBeInstanceOf(PdfError);
  await expect(promise).rejects.toMatchObject({ code });
}

describe("mergePdfs", () => {
  test("keeps every page, in the order of the files", async () => {
    const merged = await mergePdfs([await makePdf(2, 1), await makePdf(1, 2), await makePdf(3, 3)]);

    expect(await pageWidths(merged)).toEqual([101, 102, 201, 301, 302, 303]);
  });

  test("reordering the files reorders the pages", async () => {
    const first = await makePdf(1, 1);
    const second = await makePdf(1, 2);

    expect(await pageWidths(await mergePdfs([second, first]))).toEqual([201, 101]);
  });

  test("accepts ArrayBuffer input (what File.arrayBuffer() returns)", async () => {
    const bytes = await makePdf(2, 1);
    const buffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);

    expect(await countPages(buffer as ArrayBuffer)).toBe(2);
  });
});

describe("errors", () => {
  test("rejects files that do not start with %PDF-", async () => {
    const png = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a]);

    await expectPdfError(countPages(png), "not_a_pdf");
  });

  test("rejects password-protected PDFs", async () => {
    const pdf = await PDFDocument.create();
    pdf.addPage();
    // pdf-lib cannot encrypt, so mark the trailer as encrypted by hand.
    pdf.context.trailerInfo.Encrypt = pdf.context.obj({ Filter: PDFName.of("Standard") }) as PDFDict;
    const encrypted = await pdf.save();

    await expectPdfError(countPages(encrypted), "encrypted_pdf");
  });

  test("rejects damaged PDFs", async () => {
    const broken = new TextEncoder().encode("%PDF-1.7\nnot really a pdf");

    await expectPdfError(mergePdfs([broken]), "corrupted_pdf");
  });
});
