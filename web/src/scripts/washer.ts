// Washer No.1 (Washer.astro). Images wait in a queue and are washed one at a
// time: a 12 MP photo is ~48 MB of raw pixels, so twenty at once could crash
// the tab. The list of loads is the single source of truth; changes re-render.
import { DownloadLink } from "../lib/download";
import { formatBytes, plural, savingsLabel } from "../lib/format";
import {
  DEFAULT_SETTINGS,
  EXTENSION,
  formatList,
  formatFromMime,
  type ImageFormat,
  MIME,
  type OutputFormat,
  outputName,
  settingsLabel,
  type WashSettings,
} from "../lib/image";
import { washInWorker } from "../lib/image-worker-client";
import { DROPZONE_EVENT, type DropzoneFilesEvent } from "./dropzone";

type Status = "waiting" | "washing" | "done" | "failed";

interface Load {
  id: number;
  file: File;
  input: ImageFormat | null;
  thumbUrl: string;
  status: Status;
  result?: { blob: Blob; name: string; format: ImageFormat; kept: boolean };
  resultUrl?: string;
  washedWith?: string; // Settings key of the result, to know when a rewash is needed.
  error?: string;
}

const settingsKey = (settings: WashSettings): string => `${settings.format}|${settings.quality}|${settings.resize}`;

export function initWasher(root: HTMLElement, template: HTMLTemplateElement): void {
  const $ = <T extends Element>(selector: string) => root.querySelector<T>(selector)!;
  const list = $<HTMLUListElement>("[data-washer-list]");
  const led = $<HTMLElement>("[data-washer-led]");
  const quality = $<HTMLInputElement>("[data-washer-quality]");
  const qualityValue = $<HTMLElement>("[data-washer-quality-value]");
  const lossless = $<HTMLElement>("[data-washer-lossless]");
  const resize = $<HTMLInputElement>("[data-washer-resize]");
  const rewash = $<HTMLButtonElement>("[data-washer-rewash]");
  const drum = $<SVGSVGElement>("[data-drum]");
  const announce = $<HTMLElement>("[data-washer-announce]");
  const downloadAll = new DownloadLink($<HTMLAnchorElement>("[data-washer-download-all]"));

  // Machine set-up comes from Washer.astro (compress, convert, or /jpg-to-webp pages).
  const converting = root.dataset.machine === "convert";
  const accepts = (root.dataset.accepts ?? "").split(",").filter(Boolean) as ImageFormat[];
  const settings: WashSettings = { ...DEFAULT_SETTINGS, format: (root.dataset.defaultFormat as OutputFormat) ?? DEFAULT_SETTINGS.format };
  let loads: Load[] = [];
  let nextId = 1;
  let running = false;

  // ---------- Rendering ----------

  const renderRow = (load: Load): HTMLLIElement => {
    const row = template.content.firstElementChild!.cloneNode(true) as HTMLLIElement;
    const name = load.file.name;
    row.toggleAttribute("data-washing", load.status === "washing" || load.status === "waiting");
    row.querySelector<HTMLImageElement>("[data-thumb]")!.src = load.thumbUrl;
    // textContent, never innerHTML: file names come from the user.
    row.querySelector("[data-name]")!.textContent = name;

    const meta = row.querySelector<HTMLElement>("[data-meta]")!;
    const progress = row.querySelector<HTMLElement>("[data-progress]")!;
    const error = row.querySelector<HTMLElement>("[data-error]")!;
    const badge = row.querySelector<HTMLElement>("[data-badge]")!;
    const download = row.querySelector<HTMLAnchorElement>("[data-download]")!;
    const remove = row.querySelector<HTMLButtonElement>("[data-remove]")!;
    remove.setAttribute("aria-label", `Remove ${name}`);
    remove.addEventListener("click", () => removeLoad(load.id));

    if (load.status === "waiting") meta.textContent = `${formatBytes(load.file.size)} · waiting for the drum`;
    if (load.status === "washing") {
      meta.hidden = true;
      progress.hidden = false;
      progress.querySelector("[role=progressbar]")!.setAttribute("aria-label", `Washing ${name}`);
    }
    if (load.status === "failed") {
      meta.textContent = formatBytes(load.file.size);
      error.textContent = load.error ?? "This image could not be washed.";
      error.hidden = false;
    }
    if (load.status === "done" && load.result && load.resultUrl) {
      const { blob, format, kept } = load.result;
      meta.replaceChildren(
        `${formatBytes(load.file.size)} → `,
        Object.assign(document.createElement("strong"), { className: "text-ink", textContent: formatBytes(blob.size) }),
        ` · ${kept ? "already clean" : `now ${EXTENSION[format].toUpperCase()}`}`,
      );
      badge.textContent = kept ? "Already clean" : savingsLabel(load.file.size, blob.size);
      badge.hidden = false;
      download.href = load.resultUrl;
      download.download = load.result.name;
      download.setAttribute("aria-label", `Download ${load.result.name}`);
      download.hidden = false;
    }
    return row;
  };

  const renderSummary = (): void => {
    const done = loads.filter((load) => load.status === "done" && load.result);
    const busy = loads.some((load) => load.status === "waiting" || load.status === "washing");
    const summary = $<HTMLElement>("[data-washer-summary]");
    summary.hidden = done.length === 0 || busy;
    if (summary.hidden) return;

    const before = done.reduce((total, load) => total + load.file.size, 0);
    const after = done.reduce((total, load) => total + load.result!.blob.size, 0);
    const saved = Math.max(0, before - after);
    // Converting to PNG often grows a file: that is normal for the dye machine.
    $<HTMLElement>("[data-washer-saved]").textContent =
      saved > 0 ? `You saved ${formatBytes(saved)}` : converting ? `${plural(done.length, "image")} dyed` : "Already as light as it gets";
    const lighter = savingsLabel(before, after).replace("−", "");
    $<HTMLElement>("[data-washer-totals]").textContent =
      `${formatBytes(before)} in · ${formatBytes(after)} out${saved > 0 ? ` · ${lighter} lighter` : ""}`;
    $<HTMLElement>("[data-washer-download-all-label]").textContent = done.length > 1 ? "Take all home (ZIP)" : "Take it home";
    void prepareDownloadAll(done);
  };

  const render = (): void => {
    list.replaceChildren(...loads.map(renderRow));
    const hasLoads = loads.length > 0;
    $<HTMLElement>("[data-washer-empty]").hidden = hasLoads;
    $<HTMLElement>("[data-washer-more]").hidden = !hasLoads;
    $<HTMLElement>("[data-washer-placeholder]").hidden = hasLoads;
    drum.classList.toggle("drum-spin", running);
    // The first three images become the laundry in the drum; empty drum = plain colours.
    const thumbs = loads.filter((load) => load.input).slice(0, 3);
    drum.querySelectorAll<SVGImageElement>("[data-cloth-image]").forEach((image, i) => {
      const url = thumbs[i]?.thumbUrl;
      if (url) image.setAttribute("href", url);
      else image.removeAttribute("href");
    });
    const current = settingsKey(settings);
    rewash.hidden = !loads.some((load) => load.status === "done" && load.washedWith !== current);
    renderSummary();
  };

  // ---------- Downloads ----------

  let zipToken = 0;
  let packedKey = "";
  const prepareDownloadAll = async (done: Load[]): Promise<void> => {
    // render() runs on every slider tick: only rebuild when the results change.
    const key = done.map((load) => load.resultUrl).join("|");
    if (key === packedKey) return;
    packedKey = key;
    const token = ++zipToken;
    if (done.length === 1) {
      downloadAll.set(done[0].result!.blob, done[0].result!.name);
      return;
    }
    // Several images travel in one ZIP; JSZip loads only when needed.
    const { default: JSZip } = await import("jszip");
    const zip = new JSZip();
    const used = new Set<string>();
    for (const load of done) {
      let name = load.result!.name;
      for (let n = 2; used.has(name); n++) name = load.result!.name.replace(/(\.\w+)$/, `-${n}$1`);
      used.add(name);
      zip.file(name, load.result!.blob);
    }
    // Images are already compressed: STORE just boxes them.
    const blob = await zip.generateAsync({ type: "blob", compression: "STORE" });
    if (token === zipToken) downloadAll.set(blob, "toolito-clean-load.zip");
  };

  const freeResult = (load: Load): void => {
    if (load.resultUrl) URL.revokeObjectURL(load.resultUrl);
    load.resultUrl = undefined;
    load.result = undefined;
  };

  // ---------- The queue ----------

  const washNext = async (): Promise<void> => {
    if (running) return;
    const load = loads.find((item) => item.status === "waiting");
    if (!load || !load.input) return;
    running = true;
    load.status = "washing";
    render();

    const snapshot = { ...settings };
    const response = await washInWorker(await load.file.arrayBuffer(), load.input, snapshot);
    if (!loads.includes(load)) {
      running = false; // Removed while washing: drop the result.
    } else if (response.ok) {
      const washed = new Blob([response.bytes], { type: MIME[response.format] });
      // Like the API's "already optimized": never hand back a bigger file in the same format.
      const kept = washed.size >= load.file.size && response.format === load.input;
      const blob = kept ? load.file : washed;
      load.result = { blob, name: kept ? load.file.name : outputName(load.file.name, response.format), format: response.format, kept };
      load.resultUrl = URL.createObjectURL(blob);
      load.washedWith = settingsKey(snapshot);
      load.status = "done";
      announce.textContent = `${load.file.name} is clean: ${kept ? "already as light as it gets" : savingsLabel(load.file.size, blob.size)}.`;
    } else {
      load.status = "failed";
      load.error = response.message;
    }
    running = false;
    render();
    void washNext();
  };

  const addFiles = (files: File[]): void => {
    for (const file of files) {
      const detected = formatFromMime(file.type);
      const input = detected && accepts.includes(detected) ? detected : null;
      loads.push({
        id: nextId++,
        file,
        input,
        thumbUrl: URL.createObjectURL(file),
        status: input ? "waiting" : "failed",
        error: input ? undefined : `This machine takes ${formatList(accepts)} images.`,
      });
    }
    render();
    void washNext();
  };

  const removeLoad = (id: number): void => {
    const load = loads.find((item) => item.id === id);
    if (!load) return;
    freeResult(load);
    URL.revokeObjectURL(load.thumbUrl);
    loads = loads.filter((item) => item !== load);
    announce.textContent = `${load.file.name} removed.`;
    render();
  };

  // ---------- Controls ----------

  const settingsChanged = (): void => {
    led.textContent = settingsLabel(settings);
    qualityValue.textContent = String(settings.quality);
    quality.disabled = settings.format === "png";
    lossless.hidden = settings.format !== "png";
    render();
  };

  for (const pill of root.querySelectorAll<HTMLButtonElement>("[data-format]")) {
    pill.addEventListener("click", () => {
      settings.format = pill.dataset.format as OutputFormat;
      for (const other of root.querySelectorAll<HTMLButtonElement>("[data-format]")) {
        other.setAttribute("aria-pressed", String(other === pill));
      }
      settingsChanged();
    });
  }
  quality.addEventListener("input", () => {
    settings.quality = Number(quality.value);
    settingsChanged();
  });
  resize.addEventListener("change", () => {
    settings.resize = resize.checked;
    settingsChanged();
  });

  rewash.addEventListener("click", () => {
    const current = settingsKey(settings);
    for (const load of loads) {
      if (load.status === "done" && load.washedWith !== current) {
        freeResult(load);
        load.status = "waiting";
      }
    }
    announce.textContent = `Rewashing ${plural(loads.filter((load) => load.status === "waiting").length, "image")}.`;
    render();
    void washNext();
  });

  root.addEventListener(DROPZONE_EVENT, (event) => addFiles((event as DropzoneFilesEvent).detail));

  render();
}
