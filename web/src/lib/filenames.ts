// Download names built from the user's file name: contract.pdf -> contract-pages-1-3.pdf.

/** "My Contract.pdf" -> "My Contract" (no extension, no path separators). */
export function baseName(fileName: string): string {
  const name = fileName.replace(/[/\\]/g, "-").replace(/\.pdf$/i, "").trim();
  return name || "document";
}

/** One name per output PDF of the split tool. Page numbers are zero-padded so
    "every page" sorts correctly in a file manager (page-02 before page-10). */
export function splitFileNames(fileName: string, groups: number[][], pageCount: number): string[] {
  const base = baseName(fileName);
  const width = String(pageCount).length;
  const pad = (page: number) => String(page).padStart(width, "0");

  return groups.map((pages) => {
    if (pages.length === 1) return `${base}-page-${pad(pages[0])}.pdf`;
    const consecutive = pages.every((page, i) => i === 0 || page === pages[i - 1] + 1);
    return consecutive ? `${base}-pages-${pad(pages[0])}-${pad(pages.at(-1)!)}.pdf` : `${base}-selection.pdf`;
  });
}

export function zipName(fileName: string): string {
  return `${baseName(fileName)}-split.zip`;
}
