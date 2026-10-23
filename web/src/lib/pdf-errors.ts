// PDF error codes, kept apart from pdf.ts so pages can use them without
// downloading pdf-lib. Same codes as the API (docs/API.md).
export type PdfErrorCode = "not_a_pdf" | "encrypted_pdf" | "corrupted_pdf";

export class PdfError extends Error {
  constructor(
    readonly code: PdfErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "PdfError";
  }
}
