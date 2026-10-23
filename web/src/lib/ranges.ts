// Page ranges for the split tool: the "Pages" field of the basket ("1-3, 8")
// and the pins on the clothesline must say the same thing (Clothesline.md).
// Page numbers are 1-based, as people count them.

export type PageRange = { start: number; end: number }; // Both included.

export type RangesResult = { ok: true; ranges: PageRange[] } | { ok: false; error: string };

const RANGE = /^(\d+)(?:-(\d+))?$/; // "8" or "1-3"

/** Read what the user typed. Errors are friendly and never blame the user. */
export function parseRanges(text: string, pageCount: number): RangesResult {
  const parts = text
    .split(",")
    .map((part) => part.replace(/\s+/g, ""))
    .filter(Boolean);
  if (parts.length === 0) return { ok: false, error: "Pick at least one page." };

  const ranges: PageRange[] = [];
  for (const part of parts) {
    const match = RANGE.exec(part);
    if (!match) return { ok: false, error: "Use page numbers like 1-3, 8." };
    const start = Number(match[1]);
    const end = Number(match[2] ?? match[1]);
    if (start < 1) return { ok: false, error: "Use page numbers like 1-3, 8." };
    if (end < start) return { ok: false, error: `Range ${start}-${end} goes backwards. Try ${end}-${start}.` };
    if (end > pageCount) return { ok: false, error: `This PDF only has ${pageCount} ${pageCount === 1 ? "page" : "pages"}.` };
    ranges.push({ start, end });
  }
  return { ok: true, ranges };
}

/** Every page of the ranges, in the order typed, without repeats. */
export function pagesOf(ranges: PageRange[]): number[] {
  const pages = new Set<number>();
  for (const { start, end } of ranges) {
    for (let page = start; page <= end; page++) pages.add(page);
  }
  return [...pages];
}

/** Pinned pages back to text: [1, 2, 3, 8] -> "1-3, 8". */
export function formatRanges(pages: Iterable<number>): string {
  const sorted = [...new Set(pages)].sort((a, b) => a - b);
  const parts: string[] = [];
  for (let i = 0; i < sorted.length; i++) {
    const start = sorted[i];
    while (sorted[i + 1] === sorted[i] + 1) i++;
    parts.push(start === sorted[i] ? String(start) : `${start}-${sorted[i]}`);
  }
  return parts.join(", ");
}
