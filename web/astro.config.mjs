// @ts-check
import { defineConfig, envField, fontProviders } from "astro/config";

import tailwindcss from "@tailwindcss/vite";

import sitemap from "@astrojs/sitemap";

// Public address of the site: canonical URLs, sitemap and Open Graph need it
// complete. Can be overridden from the build environment (PUBLIC_SITE_URL).
const site = process.env.PUBLIC_SITE_URL ?? "https://toolito.jpgstudio.net";

// https://astro.build/config
export default defineConfig({
  site,
  // One URL per page, without a trailing slash: /merge-pdf, like every link on the
  // site. Pages are built as merge-pdf.html, which Cloudflare Pages serves at
  // /merge-pdf. (Folders would mean /merge-pdf/ and a redirect on every click.)
  trailingSlash: "never",
  build: { format: "file" },
  // Typed environment variables: a typo fails the build instead of the site.
  env: {
    schema: {
      // Where the dryer sends PDFs. "client" + "public" = it ships in the
      // browser's JavaScript, so it must never hold a secret (a URL is fine).
      // Local API: PUBLIC_API_URL=http://localhost:8000 in web/.env
      PUBLIC_API_URL: envField.string({
        context: "client",
        access: "public",
        url: true,
        default: "https://toolito-api-352538375764.us-central1.run.app",
      }),
    },
  },

  vite: {
    plugins: [tailwindcss()],
    // jSquash finds its .wasm files next to its own modules (import.meta.url);
    // Vite's dev pre-bundling would move the code and break those paths.
    optimizeDeps: {
      exclude: ["@jsquash/avif", "@jsquash/jpeg", "@jsquash/oxipng", "@jsquash/png", "@jsquash/resize", "@jsquash/webp"],
    },
    worker: { format: "es" },
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

  integrations: [sitemap()],
});