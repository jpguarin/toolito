// State of the split tool (SplitLine.astro). The pins and the "Pages" field
// always say the same thing: tapping pins rewrites the field, typing in the
// field moves the pins (Clothesline.md).
import { plural } from "../lib/format";
import { PdfError } from "../lib/pdf-errors";
import { countPagesInWorker } from "../lib/pdf-worker-client";
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
