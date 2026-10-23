// The five machines of the laundromat (BRAND-BOOK §2, MachineCard.md).
export type MachineId = "image" | "convert" | "dryer" | "fold" | "sort";

export interface Machine {
  id: MachineId;
  number: number;
  tag: string; // Short LED code.
  title: string;
  line: string; // The cycle and where it runs.
  href: string;
}

export const MACHINES: Machine[] = [
  { id: "image", number: 1, tag: "IMG", title: "Compress image", line: "Gentle cycle · your device", href: "/compress-image" },
  { id: "convert", number: 2, tag: "DYE", title: "Convert image", line: "Change colors… er, formats", href: "/convert-image" },
  { id: "dryer", number: 3, tag: "DRYER", title: "Compress PDF", line: "Heavy loads · emptied after every cycle", href: "/compress-pdf" },
  { id: "fold", number: 4, tag: "FOLD", title: "Merge PDF", line: "Fold them into one pile", href: "/merge-pdf" },
  { id: "sort", number: 5, tag: "SORT", title: "Split PDF", line: "Sort the pages you need", href: "/split-pdf" },
];
