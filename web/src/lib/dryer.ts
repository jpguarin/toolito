// The dryer's state and rules (docs/DRYER-FLOW.md): one state object with the
// phase as discriminant, the cycle levels, the check before uploading and the
// "Out of order" catalogue. Pure logic: no network, no DOM.

export type Cycle = "low" | "recommended" | "extreme"; // API `level` (docs/API.md)

export type DryerErrorCode =
  | "file_too_large"
  | "too_many_pages"
  | "not_a_pdf"
  | "encrypted_pdf"
  | "corrupted_pdf"
  | "rate_limited"
  | "processing_timeout"
  | "offline"
  | "internal_error";

// One shape per phase: "done and failed at once" cannot even be written (§2).
export type DryerState =
  | { phase: "empty" }
  | { phase: "loaded"; file: File; cycle: Cycle }
  | { phase: "uploading"; file: File; cycle: Cycle; percent: number }
  | { phase: "drying"; file: File; cycle: Cycle; startedAt: number }
  | {
      phase: "done";
      file: File;
      cycle: Cycle;
      result: Blob;
      originalSize: number;
      compressedSize: number;
      alreadyOptimized: boolean;
    }
  | { phase: "error"; file: File | null; cycle: Cycle; code: DryerErrorCode; retryAfter?: number };

/** CycleOption.md: Delicate -> low, Normal -> recommended (default), Heavy duty -> extreme. */
export const CYCLES: { value: Cycle; name: string }[] = [
  { value: "low", name: "Delicate" },
  { value: "recommended", name: "Normal" },
  { value: "extreme", name: "Heavy duty" },
];

export const DEFAULT_CYCLE: Cycle = "recommended";
export const MAX_PDF_BYTES = 30 * 1024 * 1024; // Same limit as the API (MAX_FILE_MB).
export const MAX_PDF_PAGES = 500;
export const SLOW_DRYING_MS = 8_000; // §2: after 8 s, tell people big PDFs take longer.

/**
 * §7: check size and the %PDF- header before uploading (reads only 5 bytes).
 * Saves a pointless upload; the API checks again anyway.
 */
export async function checkBeforeUpload(file: Blob): Promise<DryerErrorCode | null> {
  if (file.size > MAX_PDF_BYTES) return "file_too_large";
  const head = new Uint8Array(await file.slice(0, 5).arrayBuffer());
  return String.fromCharCode(...head) === "%PDF-" ? null : "not_a_pdf";
}

export interface OutOfOrderCard {
  led: string;
  title: string;
  body: string;
  note?: string; // Handwritten note taped on the machine (aria-hidden).
  action: { label: string; href: string } | { label: string; kind: "retry" | "choose" | "cooldown" };
}

/** §5 and design/mockups/TlErrors.dc.html. Never blame the user, never show technical details. */
export const OUT_OF_ORDER: Record<DryerErrorCode, OutOfOrderCard> = {
  file_too_large: {
    led: "E-413",
    title: "This load is too heavy",
    body: "The dryer takes up to 30 MB per load. Split your PDF on the clothesline first, then dry each part.",
    note: "Too heavy!",
    action: { label: "Go to Split PDF", href: "/split-pdf" },
  },
  too_many_pages: {
    led: "E-413",
    title: "This load is too heavy",
    body: `The dryer takes up to ${MAX_PDF_PAGES} pages per load. Split your PDF on the clothesline first, then dry each part.`,
    note: "Too heavy!",
    action: { label: "Go to Split PDF", href: "/split-pdf" },
  },
  not_a_pdf: {
    led: "E-415",
    title: "That's not laundry",
    body: "The dryer only takes PDFs. Got a photo instead? Washer No.1 handles images.",
    action: { label: "Go to Washer No.1", href: "/compress-image" },
  },
  encrypted_pdf: {
    led: "LOCKED",
    title: "This basket is locked",
    body: "Your PDF has a password. Remove it in your PDF reader, then drop the file in again.",
    action: { label: "Choose another file", kind: "choose" },
  },
  corrupted_pdf: {
    led: "E-422",
    title: "This one's torn",
    body: "We couldn't open this PDF. It may be damaged. Try saving it again from the app that made it.",
    action: { label: "Choose another file", kind: "choose" },
  },
  rate_limited: {
    led: "COOLING",
    title: "Machine cooling down",
    body: "You've run a lot of loads in a row. Give it a minute and try again.",
    action: { label: "Ready again in", kind: "cooldown" },
  },
  processing_timeout: {
    led: "E-504",
    title: "This load took too long",
    body: "Big, photo-heavy PDFs can take more than a minute to dry. Split it on the clothesline and dry each part.",
    action: { label: "Go to Split PDF", href: "/split-pdf" },
  },
  offline: {
    led: "NO POWER",
    title: "You're offline",
    body: "The dryer needs internet. The washers, folding table and clothesline still work offline.",
    note: "Back soon",
    action: { label: "Try again", kind: "retry" },
  },
  internal_error: {
    led: "E-500",
    title: "Something jammed the drum",
    body: "That one's on us, not you. Your file wasn't kept. Give it a moment and run the load again.",
    note: "Jammed!",
    action: { label: "Try again", kind: "retry" },
  },
};

/** API error codes (docs/API.md) -> dryer codes. Anything unknown is our fault, not theirs. */
export function errorFromApi(code: unknown): DryerErrorCode {
  const known: DryerErrorCode[] = [
    "file_too_large",
    "too_many_pages",
    "not_a_pdf",
    "encrypted_pdf",
    "corrupted_pdf",
    "rate_limited",
    "processing_timeout",
  ];
  return known.includes(code as DryerErrorCode) ? (code as DryerErrorCode) : "internal_error";
}

/** §5: no response at all is "offline" only if the browser says so; otherwise the server failed. */
export function networkError(online: boolean): DryerErrorCode {
  return online ? "internal_error" : "offline";
}

/** "informe.pdf" -> "informe-compressed.pdf" (§4). */
export function compressedName(fileName: string): string {
  const base = fileName.replace(/\.pdf$/i, "") || "document";
  return `${base}-compressed.pdf`;
}

/** LED clock while drying: elapsed time as m:ss, never a percentage (§2). */
export function elapsedLabel(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}
