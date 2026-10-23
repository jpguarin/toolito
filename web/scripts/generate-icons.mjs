// Renders the app icon from design/icons/*.svg into the PNG sizes browsers and
// phones ask for. Run after changing the icon: npm run icons (the PNGs are committed).
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { Resvg } from "@resvg/resvg-js";

const design = (name) => readFileSync(new URL(`../../design/icons/${name}`, import.meta.url), "utf8");
const out = (name) => new URL(`../public/icons/${name}`, import.meta.url);
mkdirSync(new URL("../public/icons/", import.meta.url), { recursive: true });

const targets = [
  { source: "app-icon.svg", name: "icon-192.png", size: 192 },
  { source: "app-icon.svg", name: "icon-512.png", size: 512 },
  { source: "app-icon.svg", name: "favicon-32.png", size: 32 },
  { source: "app-icon-maskable.svg", name: "maskable-512.png", size: 512 },
  { source: "app-icon-maskable.svg", name: "apple-touch-icon.png", size: 180 }, // iOS rounds it itself.
];

for (const { source, name, size } of targets) {
  const png = new Resvg(design(source), { fitTo: { mode: "width", value: size } }).render().asPng();
  writeFileSync(out(name), png);
  console.log(`${name.padEnd(22)} ${size}×${size}  ${(png.length / 1024).toFixed(1)} KB`);
}

// Social card for link previews (Open Graph): 1200 x 630.
const card = new Resvg(design("social-card.svg"), { fitTo: { mode: "width", value: 1200 } }).render().asPng();
writeFileSync(new URL("../public/social-card.png", import.meta.url), card);
console.log(`${"social-card.png".padEnd(22)} 1200×630  ${(card.length / 1024).toFixed(1)} KB`);

// The SVG favicon is the icon itself (sharp at any size).
writeFileSync(new URL("../public/favicon.svg", import.meta.url), design("app-icon.svg"));
