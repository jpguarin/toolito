// State of the split tool (SplitLine.astro). The pins and the "Pages" field
// always say the same thing: tapping pins rewrites the field, typing in the
// field moves the pins (Clothesline.md).
import { DownloadLink } from "../lib/download";
import { splitFileNames, zipName } from "../lib/filenames";
import { formatBytes, plural } from "../lib/format";
import { PdfError } from "../lib/pdf-errors";
import { countPagesInWorker, splitInWorker } from "../lib/pdf-worker-client";
import { formatRanges, pagesOf, parseRanges, type RangesResult } from "../lib/ranges";
import { DROPZONE_EVENT, type DropzoneFilesEvent } from "./dropzone";
import { TABS_EVENT, type TabsChangeEvent } from "./tabs";

export type SplitMode = "pick" | "ranges" | "every";

// Same gentle tilts as the mockup, so pages do not jump around on re-render.
const TILTS = [-2, 1.5, -1, 2, -1.5, 1, -1, 2, -2, 1, -1.5, 2];

export interface SplitState {
  file?: File;
  pageCount: number;
  pinned: Set<number>;
  mode: SplitMode;
  parsed: RangesResult;
}

/** What TAKE DOWN & SPLIT will produce: groups of 1-based pages, one PDF each. */
export function splitGroups(state: SplitState, output: "one" | "per-range"): number[][] {
  if (state.mode === "every") return Array.from({ length: state.pageCount }, (_, i) => [i + 1]);
  if (!state.parsed.ok) return [];
  if (output === "one") return [pagesOf(state.parsed.ranges)];
  return state.parsed.ranges.map(({ start, end }) => Array.from({ length: end - start + 1 }, (_, i) => start + i));
}

export function initSplitLine(root: HTMLElement, template: HTMLTemplateElement): void {
  const $ = <T extends Element>(selector: string) => root.querySelector<T>(selector)!;
  const pagesGrid = $<HTMLElement>("[data-split-pages]");
  const field = $<HTMLInputElement>("[data-split-field]");
  const hint = $<HTMLElement>("[data-split-hint]");
  const count = $<HTMLElement>("[data-split-count]");
  const summary = $<HTMLElement>("[data-split-summary]");
  const button = $<HTMLButtonElement>("[data-split-button]");
  const error = $<HTMLElement>("[data-split-error]");
  const announce = $<HTMLElement>("[data-split-announce]");
  const idleHint = hint.textContent ?? "";
  const idleLabel = button.textContent?.trim() ?? "Take down & split";
  const result = $<HTMLElement>("[data-split-result]");
  const resultMeta = $<HTMLElement>("[data-split-result-meta]");
  const downloadLabel = $<HTMLElement>("[data-split-download-label]");
  const download = new DownloadLink($<HTMLAnchorElement>("[data-split-download]"));

  const state: SplitState = { pageCount: 0, pinned: new Set(), mode: "pick", parsed: { ok: false, error: "" } };
  let lastClicked: number | undefined;
  let showFieldError = false; // FormField.md: errors only after blur or submit.

  const output = (): "one" | "per-range" =>
    root.querySelector<HTMLInputElement>('input[name="split-output"]:checked')?.value === "per-range" ? "per-range" : "one";

  const renderPins = (): void => {
    for (const pageButton of pagesGrid.querySelectorAll<HTMLButtonElement>("button")) {
      const page = Number(pageButton.dataset.page);
      const pinned = state.pinned.has(page);
      pageButton.setAttribute("aria-pressed", String(pinned));
      pageButton.setAttribute("aria-label", `Page ${page}`);
    }
  };

  const renderBasket = (): void => {
    // Any change makes an earlier result stale: hide it and free its memory.
    download.clear();
    result.hidden = true;
    button.hidden = false;
    const loaded = Boolean(state.file);
    field.disabled = !loaded || state.mode === "every";
    $<HTMLElement>("[data-split-picker]").hidden = state.mode === "every";
    $<HTMLElement>("[data-split-output]").hidden = state.mode === "every";

    const invalid = loaded && state.mode !== "every" && !state.parsed.ok && showFieldError;
    field.toggleAttribute("aria-invalid", invalid);
    hint.textContent = invalid && !state.parsed.ok ? state.parsed.error : idleHint;
    hint.classList.toggle("text-error", invalid);
    hint.classList.toggle("text-muted", !invalid);

    count.textContent = `${state.pinned.size} selected`;
    const groups = splitGroups(state, output());
    const pages = new Set(groups.flat()).size;
    button.disabled = groups.length === 0;
    summary.textContent = !loaded
      ? "Hang a PDF on the line first."
      : groups.length === 0
        ? "Pick at least one page."
        : `You take home ${plural(groups.length, "PDF")} · ${plural(pages, "page")}${groups.length > 1 ? " (in one ZIP)" : ""}.`;
  };

  const setPinnedFromField = (): void => {
    state.parsed = parseRanges(field.value, state.pageCount);
    state.pinned = new Set(state.parsed.ok ? pagesOf(state.parsed.ranges) : state.pinned);
    renderPins();
    renderBasket();
  };

  const setFieldFromPins = (): void => {
    field.value = formatRanges(state.pinned);
    showFieldError = false;
    state.parsed = parseRanges(field.value, state.pageCount);
    renderPins();
    renderBasket();
  };

  const togglePage = (page: number, shiftKey: boolean): void => {
    const pin = !state.pinned.has(page);
    if (shiftKey && lastClicked !== undefined) {
      // Shift-click: the whole range between the last tap and this one follows this page.
      const [from, to] = [Math.min(lastClicked, page), Math.max(lastClicked, page)];
      for (let p = from; p <= to; p++) pin ? state.pinned.add(p) : state.pinned.delete(p);
    } else {
      pin ? state.pinned.add(page) : state.pinned.delete(page);
    }
    lastClicked = page;
    announce.textContent = `Page ${page} ${pin ? "pinned" : "unpinned"}. ${state.pinned.size} selected.`;
    setFieldFromPins();
  };

  const hangPages = (): void => {
    pagesGrid.replaceChildren(
      ...Array.from({ length: state.pageCount }, (_, index) => {
        const page = index + 1;
        const cell = template.content.firstElementChild!.cloneNode(true) as HTMLElement;
        const pageButton = cell.querySelector("button")!;
        pageButton.dataset.page = String(page);
        pageButton.style.rotate = `${TILTS[index % TILTS.length]}deg`;
        pageButton.querySelector("[data-page-number]")!.textContent = String(page);
        pageButton.addEventListener("click", (event) => togglePage(page, event.shiftKey));
        return cell;
      }),
    );
  };

  const load = async (file: File): Promise<void> => {
    error.hidden = true;
    try {
      state.pageCount = await countPagesInWorker(await file.arrayBuffer());
    } catch (problem) {
      error.textContent = `${file.name}: ${problem instanceof PdfError ? problem.message : "This file could not be read."}`;
      error.hidden = false;
      return;
    }
    state.file = file;
    state.pinned = new Set();
    lastClicked = undefined;
    $<HTMLElement>("[data-split-empty]").hidden = true;
    $<HTMLElement>("[data-split-loaded]").hidden = false;
    // textContent, never innerHTML: the file name comes from the user.
    $<HTMLElement>("[data-split-file]").textContent = `${file.name} · ${plural(state.pageCount, "page")}`;
    $<HTMLElement>("[data-split-every]").textContent = `${plural(state.pageCount, "PDF")} in one ZIP`;
    hangPages();
    setFieldFromPins();
    announce.textContent = `${file.name} is on the line: ${plural(state.pageCount, "page")}.`;
  };

  /** Several PDFs travel in one ZIP; JSZip is only downloaded when needed. */
  const pack = async (parts: Uint8Array[], names: string[], file: File): Promise<{ blob: Blob; name: string }> => {
    if (parts.length === 1) return { blob: new Blob([parts[0] as BlobPart], { type: "application/pdf" }), name: names[0] };
    const { default: JSZip } = await import("jszip");
    const zip = new JSZip();
    parts.forEach((part, i) => zip.file(names[i], part));
    // PDFs are already compressed inside: STORE just boxes them, almost instantly.
    const blob = await zip.generateAsync({ type: "blob", compression: "STORE" });
    return { blob, name: zipName(file.name) };
  };

  const split = async (): Promise<void> => {
    const file = state.file;
    const groups = splitGroups(state, output());
    if (!file || groups.length === 0) {
      showFieldError = true;
      renderBasket();
      return;
    }
    button.disabled = true;
    button.setAttribute("aria-busy", "true");
    button.textContent = "Taking down…";
    announce.textContent = "Taking the pages down…";
    try {
      const parts = await splitInWorker(await file.arrayBuffer(), groups);
      const { blob, name } = await pack(parts, splitFileNames(file.name, groups, state.pageCount), file);
      download.set(blob, name);
      const zipped = parts.length > 1;
      resultMeta.textContent = `${plural(parts.length, "PDF")}${zipped ? " in one ZIP" : ""} · ${formatBytes(blob.size)}`;
      downloadLabel.textContent = zipped ? "Take all home (ZIP)" : "Take it home";
      result.hidden = false;
      button.hidden = true;
      announce.textContent = `Ready: ${plural(parts.length, "PDF")}${zipped ? " in one ZIP" : ""}.`;
      $<HTMLAnchorElement>("[data-split-download]").focus();
    } catch (problem) {
      error.textContent = problem instanceof PdfError ? problem.message : "The PDF could not be split. Please try again.";
      error.hidden = false;
    } finally {
      button.removeAttribute("aria-busy");
      button.textContent = idleLabel;
      button.disabled = splitGroups(state, output()).length === 0;
    }
  };

  button.addEventListener("click", split);

  root.addEventListener(DROPZONE_EVENT, (event) => {
    const [file] = (event as DropzoneFilesEvent).detail;
    if (file) void load(file);
  });

  document.addEventListener(TABS_EVENT, (event) => {
    state.mode = (event as TabsChangeEvent).detail as SplitMode;
    renderBasket();
  });

  field.addEventListener("input", setPinnedFromField);
  field.addEventListener("blur", () => {
    showFieldError = true;
    renderBasket();
  });
  root.addEventListener("change", (event) => {
    if (event.target instanceof HTMLInputElement && event.target.name === "split-output") renderBasket();
  });

  renderBasket();
}
