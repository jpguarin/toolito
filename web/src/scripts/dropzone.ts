// Behaviour of every <Dropzone>: file picker, drag-and-drop highlight and
// the "dropzone:files" event that tools listen for.

export const DROPZONE_EVENT = "dropzone:files";

export type DropzoneFilesEvent = CustomEvent<File[]>;

export function initDropzone(zone: HTMLLabelElement): void {
  const input = zone.querySelector<HTMLInputElement>('input[type="file"]');
  const title = zone.querySelector<HTMLElement>("[data-title]");
  const hint = zone.querySelector<HTMLElement>("[data-hint]");
  if (!input || !title || !hint) return;

  const idleTitle = title.textContent ?? "";
  const idleHint = hint.textContent ?? "";
  // dragenter/dragleave also fire over child elements (icon, texts), so we
  // count them: the zone is only "left" when the count is back to zero.
  let depth = 0;

  const setOver = (over: boolean, count = 0): void => {
    zone.toggleAttribute("data-over", over);
    title.textContent = over ? "Let go to load it" : idleTitle;
    hint.textContent = over ? `${count} ${count === 1 ? "file" : "files"}` : idleHint;
  };

  const emit = (files: File[]): void => {
    const loaded = input.multiple ? files : files.slice(0, 1);
    if (loaded.length === 0) return;
    zone.dispatchEvent(new CustomEvent(DROPZONE_EVENT, { detail: loaded, bubbles: true }));
  };

  input.addEventListener("change", () => {
    emit(Array.from(input.files ?? []));
    input.value = ""; // So choosing the same file again still fires "change".
  });

  zone.addEventListener("dragenter", (event) => {
    event.preventDefault();
    depth += 1;
    setOver(true, event.dataTransfer?.items.length ?? 0);
  });

  // Without preventDefault here the browser refuses the drop and opens the file.
  zone.addEventListener("dragover", (event) => event.preventDefault());

  zone.addEventListener("dragleave", () => {
    depth = Math.max(0, depth - 1);
    if (depth === 0) setOver(false);
  });

  zone.addEventListener("drop", (event) => {
    event.preventDefault();
    depth = 0;
    setOver(false);
    emit(Array.from(event.dataTransfer?.files ?? []));
  });
}
