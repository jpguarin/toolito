// Generates dist/sw.js after `astro build` with Workbox (MIT, Google).
// The service worker saves the site so the browser tools work offline.
// Runs as part of `npm run build`; see docs/DECISIONS.md for why not @vite-pwa/astro.
import { generateSW } from "workbox-build";

const AVIF = /avif_(enc|enc_mt|dec)-.*\.wasm$/; // ~8 MB: cached only when someone picks AVIF.

const { count, size, warnings } = await generateSW({
  globDirectory: "dist",
  swDest: "dist/sw.js",
  // Precache: pages, code, styles, fonts, icons and the common codecs (~2 MB).
  globPatterns: ["**/*.{html,js,css,woff2,svg,ico,png,webmanifest,wasm}"],
  globIgnores: ["**/avif_*.wasm", "sw.js", "workbox-*.js"],
  maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
  // A new version waits until the visitor taps "Update" in the toast (register-sw.ts
  // sends SKIP_WAITING). clientsClaim only matters on the very first visit.
  skipWaiting: false,
  clientsClaim: true,
  cleanupOutdatedCaches: true,
  // Pages are files (merge-pdf.html) served at clean URLs (/merge-pdf); Workbox's
  // precache route already maps /merge-pdf to merge-pdf.html (cleanURLs, on by default).
  directoryIndex: "index.html",
  runtimeCaching: [
    {
      // AVIF codecs: downloaded on first use, then kept for offline use.
      urlPattern: ({ url }) => AVIF.test(url.pathname),
      handler: "CacheFirst",
      options: { cacheName: "toolito-avif-codecs", expiration: { maxEntries: 6 } },
    },
  ],
  // Requests to the API are never listed here, so they always go to the network:
  // a user's PDF must never be stored (CLAUDE.md, privacy).
});

for (const warning of warnings) console.warn(warning);
console.log(`Service worker: ${count} files precached (${(size / 1024 / 1024).toFixed(1)} MB).`);
