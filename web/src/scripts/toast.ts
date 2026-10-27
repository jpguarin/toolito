// Drives the one toast in BaseLayout (design/components/Toast.md).
export interface ToastAction {
  label: string;
  primary?: boolean;
  onSelect: () => void;
}

export interface ToastContent {
  title: string;
  text: string;
  actions: ToastAction[];
}

const PRIMARY = "label min-h-tap rounded-pill bg-btn px-5 text-on-btn";
const SECONDARY = "label min-h-tap rounded-pill border-md border-line px-5 text-ink";

const toast = (): HTMLElement | null => document.querySelector<HTMLElement>("[data-toast]");

export const isToastOpen = (): boolean => toast()?.hidden === false;

export function hideToast(): void {
  const element = toast();
  if (element) element.hidden = true;
}

/** Shows the toast, replacing whatever it was showing. */
export function showToast(content: ToastContent): void {
  const element = toast();
  if (!element) return;
  // textContent, never innerHTML: nothing here is markup.
  element.querySelector("[data-toast-title]")!.textContent = content.title;
  element.querySelector("[data-toast-text]")!.textContent = content.text;
  element.querySelector("[data-toast-actions]")!.replaceChildren(
    ...content.actions.map((action) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = action.primary ? PRIMARY : SECONDARY;
      button.textContent = action.label;
      button.addEventListener("click", () => {
        hideToast();
        action.onSelect();
      });
      return button;
    }),
  );
  element.hidden = false;
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") hideToast();
});
