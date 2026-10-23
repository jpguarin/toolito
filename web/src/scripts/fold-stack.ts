// State and rendering of the folding table (FoldStack.astro). The list of loads
// is the single source of truth; every change re-renders the rows and the pile.
import { formatBytes, plural } from "../lib/format";
import { DROPZONE_EVENT, type DropzoneFilesEvent } from "./dropzone";

// pdf-lib is big (~400 KB): load it only when the first PDF arrives, so
// visitors who just read the page never download it.
const loadPdfTools = () => import("../lib/pdf");

export interface Load {
  id: number;
  file: File;
  pages: number;
  towel: string; // CSS colour token of its stripe and pile bar.
}

// Towel colours cycle through the five glass tokens (FoldStack.md).
const TOWELS = ["--glass-image", "--glass-convert", "--glass-dryer", "--glass-fold", "--glass-sort"];

type FocusTarget = { id: number; part: "row" | "up" | "down" };

export function initFoldStack(root: HTMLElement, template: HTMLTemplateElement): void {
  const $ = <T extends Element>(selector: string) => root.querySelector<T>(selector)!;
  const list = $<HTMLOListElement>("[data-fold-list]");
  const pile = $<HTMLElement>("[data-fold-pile]");
  const summary = $<HTMLElement>("[data-fold-summary]");
  const button = $<HTMLButtonElement>("[data-fold-button]");
  const why = $<HTMLElement>("[data-fold-why]");
  const errors = $<HTMLUListElement>("[data-fold-errors]");
  const announce = $<HTMLElement>("[data-fold-announce]");

  let loads: Load[] = [];
  let nextId = 1;

  const move = (id: number, offset: -1 | 1, part: FocusTarget["part"]): void => {
    const from = loads.findIndex((load) => load.id === id);
    const to = from + offset;
    if (from < 0 || to < 0 || to >= loads.length) return;
    const reordered = [...loads];
    [reordered[from], reordered[to]] = [reordered[to], reordered[from]];
    loads = reordered;
    announce.textContent = `${loads[to].file.name} moved to position ${to + 1} of ${loads.length}.`;
    render({ id, part });
  };

  const remove = (id: number): void => {
    const index = loads.findIndex((load) => load.id === id);
    const [removed] = loads.splice(index, 1);
    announce.textContent = `${removed.file.name} removed from the table.`;
    const neighbour = loads[Math.min(index, loads.length - 1)];
    render(neighbour ? { id: neighbour.id, part: "row" } : undefined);
  };

  const renderRow = (load: Load, index: number): HTMLLIElement => {
    const row = template.content.firstElementChild!.cloneNode(true) as HTMLLIElement;
    const name = load.file.name;
    row.dataset.id = String(load.id);
    row.setAttribute("aria-label", `${index + 1}. ${name}`);
    row.querySelector<HTMLElement>("[data-towel]")!.style.setProperty("--towel", `var(${load.towel})`);
    // textContent, never innerHTML: file names come from the user.
    row.querySelector("[data-number]")!.textContent = String(index + 1);
    row.querySelector("[data-name]")!.textContent = name;
    row.querySelector("[data-meta]")!.textContent = `${plural(load.pages, "page")} · ${formatBytes(load.file.size)}`;

    const up = row.querySelector<HTMLButtonElement>("[data-up]")!;
    const down = row.querySelector<HTMLButtonElement>("[data-down]")!;
    const close = row.querySelector<HTMLButtonElement>("[data-remove]")!;
    up.setAttribute("aria-label", `Move ${name} up`);
    down.setAttribute("aria-label", `Move ${name} down`);
    close.setAttribute("aria-label", `Remove ${name}`);
    up.disabled = index === 0;
    down.disabled = index === loads.length - 1;
    up.addEventListener("click", () => move(load.id, -1, "up"));
    down.addEventListener("click", () => move(load.id, 1, "down"));
    close.addEventListener("click", () => remove(load.id));

    // Arrow keys on a focused row move it (FoldStack.md).
    row.addEventListener("keydown", (event) => {
      if (event.target !== row) return;
      if (event.key === "ArrowUp" || event.key === "ArrowDown") {
        event.preventDefault();
        move(load.id, event.key === "ArrowUp" ? -1 : 1, "row");
      }
    });
    return row;
  };

  const render = (focus?: FocusTarget): void => {
    list.replaceChildren(...loads.map(renderRow));

    pile.replaceChildren(
      ...loads.map((load, index) => {
        const bar = document.createElement("div");
        bar.className = `h-6 rounded-sm border-md border-line ${index % 2 === 0 ? "-translate-x-2" : "translate-x-2"}`;
        bar.style.backgroundColor = `var(${load.towel})`;
        return bar;
      }),
    );

    const pages = loads.reduce((total, load) => total + load.pages, 0);
    summary.textContent = loads.length ? `${plural(loads.length, "file")} · ${plural(pages, "page")}` : "The table is empty";
    button.disabled = loads.length < 2;
    why.hidden = loads.length >= 2;

    const hasLoads = loads.length > 0;
    $<HTMLElement>("[data-fold-empty]").hidden = hasLoads;
    $<HTMLElement>("[data-fold-more]").hidden = !hasLoads;
    $<HTMLElement>("[data-fold-hint]").hidden = loads.length < 2;

    if (focus) {
      const row = list.querySelector<HTMLElement>(`[data-id="${focus.id}"]`);
      const control = focus.part === "row" ? row : row?.querySelector<HTMLButtonElement>(`[data-${focus.part}]`);
      // A disabled button cannot keep focus (e.g. moved to the top), so fall back to the row.
      (control instanceof HTMLButtonElement && control.disabled ? row : control)?.focus();
    }
  };

  const showErrors = (messages: string[]): void => {
    errors.replaceChildren(
      ...messages.map((message) => {
        const item = document.createElement("li");
        item.textContent = message;
        return item;
      }),
    );
    errors.hidden = messages.length === 0;
  };

  root.addEventListener(DROPZONE_EVENT, async (event) => {
    const { countPages, PdfError } = await loadPdfTools();
    const problems: string[] = [];
    for (const file of (event as DropzoneFilesEvent).detail) {
      try {
        const pages = await countPages(await file.arrayBuffer());
        const towel = TOWELS[(nextId - 1) % TOWELS.length];
        loads = [...loads, { id: nextId++, file, pages, towel }];
      } catch (error) {
        const reason = error instanceof PdfError ? error.message : "This file could not be read.";
        problems.push(`${file.name}: ${reason}`);
      }
    }
    showErrors(problems);
    render();
    if (problems.length === 0) announce.textContent = `${plural(loads.length, "file")} on the table.`;
  });

  render();
}
