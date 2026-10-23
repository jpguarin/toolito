// Installs the service worker (dist/sw.js, built by scripts/build-sw.mjs) so the
// browser tools keep working offline. Only in production builds.
if ("serviceWorker" in navigator) {
  if (import.meta.env.PROD) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    });
  } else {
    // `npm run preview` now runs on port 4322, so its service worker can no longer
    // reach the dev server (4321). This cleanup stays for anyone who tested the
    // build on 4321 before that change.
    void navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const registration of registrations) void registration.unregister();
    });
  }
}
