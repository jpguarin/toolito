// Tabs pattern (SegmentedTabs.md): the whole row is one Tab stop ("roving
// tabindex"); arrow keys move between tabs. Each tab shows its tabpanel and
// announces the change with a "tabs:change" event.
export const TABS_EVENT = "tabs:change";

export type TabsChangeEvent = CustomEvent<string>; // detail: the selected tab id

export function initTabs(list: HTMLElement): void {
  const tabs = [...list.querySelectorAll<HTMLButtonElement>('[role="tab"]')];

  const select = (tab: HTMLButtonElement, focus: boolean): void => {
    for (const other of tabs) {
      const isSelected = other === tab;
      other.setAttribute("aria-selected", String(isSelected));
      other.tabIndex = isSelected ? 0 : -1;
      const panel = document.getElementById(other.getAttribute("aria-controls") ?? "");
      if (panel) panel.hidden = !isSelected;
    }
    if (focus) tab.focus();
    list.dispatchEvent(new CustomEvent(TABS_EVENT, { detail: tab.dataset.tab, bubbles: true }));
  };

  for (const tab of tabs) {
    tab.addEventListener("click", () => select(tab, false));
  }

  list.addEventListener("keydown", (event) => {
    const index = tabs.indexOf(document.activeElement as HTMLButtonElement);
    if (index < 0) return;
    const next = { ArrowRight: index + 1, ArrowLeft: index - 1, Home: 0, End: tabs.length - 1 }[event.key];
    if (next === undefined) return;
    event.preventDefault();
    select(tabs[(next + tabs.length) % tabs.length], true);
  });

  // Show only the panel of the tab selected in the HTML.
  const initial = tabs.find((tab) => tab.getAttribute("aria-selected") === "true") ?? tabs[0];
  if (initial) select(initial, false);
}
