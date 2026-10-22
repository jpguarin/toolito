// @ts-check
import { defineConfig, fontProviders } from "astro/config";

import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
  },
  // Brand fonts (BRAND-BOOK §5), downloaded at build time and served from our
  // own site: visitors never connect to Google, and fonts work offline.
  fonts: [
    {
      provider: fontProviders.fontsource(),
      name: "Bungee",
      cssVariable: "--font-bungee",
      weights: [400],
      styles: ["normal"],
      subsets: ["latin"],
    },
    {
      provider: fontProviders.fontsource(),
      name: "Work Sans",
      cssVariable: "--font-work-sans",
      weights: [400, 600, 800],
      styles: ["normal"],
      subsets: ["latin"],
    },
    {
      provider: fontProviders.fontsource(),
      name: "Caveat",
      cssVariable: "--font-caveat",
      weights: [700],
      styles: ["normal"],
      subsets: ["latin"],
    },
  ],
});
