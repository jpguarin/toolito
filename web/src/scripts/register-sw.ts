// Installs the service worker (dist/sw.js, built by scripts/build-sw.mjs) so the
// browser tools keep working offline. Only in production builds.
if ("serviceWorker" in navigator) {
  if (import.meta.env.PROD) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    });
  } else {
    // `npm run dev` shares localhost:4321 with `npm run preview`: a service worker
    // left over from testing the build would serve stale copies and hide your
    // changes. In development, always remove it.
    void navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const registration of registrations) void registration.unregister();
    });
  }
}
