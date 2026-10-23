// Main navigation, shared by ShopHeader (inner pages) and StorefrontHeader (home).
export type Section = "images" | "pdfs" | "house-rules";

export const MAIN_LINKS: { section: Section; label: string; href: string }[] = [
  { section: "images", label: "Images", href: "/compress-image" },
  { section: "pdfs", label: "PDFs", href: "/compress-pdf" },
  { section: "house-rules", label: "House rules", href: "/#house-rules" },
];
