// Human-readable sizes for the interface: numbers always carry a unit (BRAND-BOOK §3).
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function plural(count: number, singular: string, pluralForm = `${singular}s`): string {
  return `${count} ${count === 1 ? singular : pluralForm}`;
}

/** Change in size as the brand shows it (BRAND-BOOK §3): "−72%" with a real minus sign. */
export function savingsLabel(before: number, after: number): string {
  if (before <= 0) return "0%";
  const change = Math.round(((after - before) / before) * 100);
  if (change === 0) return "0%";
  return change < 0 ? `\u2212${-change}%` : `+${change}%`;
}
