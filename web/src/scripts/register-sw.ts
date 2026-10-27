// Installs the service worker (dist/sw.js, built by scripts/build-sw.mjs) so the
// browser tools keep working offline. Only in production builds.
import { showToast } from "./toast";

// A new version waits until the visitor says "Update" (build-sw.mjs has no skipWaiting).
function offerUpdate(waiting: ServiceWorker): void {
  showToast({
    title: "A fresh cycle is ready",
    text: "Update Toolito to get the latest version.",
    actions: [
      {
        label: "Update",
        primary: true,
        onSelect: () => {
          // The new worker takes control after SKIP_WAITING; reload so the page runs its files.
          navigator.serviceWorker.addEventListener("controllerchange", () => location.reload(), { once: true });
          waiting.postMessage({ type: "SKIP_WAITING" });
        },
      },
      { label: "Later", onSelect: () => undefined },
    ],
  });
}

function watchForUpdates(registration: ServiceWorkerRegistration): void {
  // No controller yet = first visit: there is no "old version" to update from.
  const offerIfWaiting = (): void => {
    if (registration.waiting && navigator.serviceWorker.controller) offerUpdate(registration.waiting);
  };
  const track = (worker: ServiceWorker | null): void => {
    worker?.addEventListener("statechange", () => {
      if (worker.state === "installed") offerIfWaiting();
    });
  };
  offerIfWaiting();
  // The update may already be installing by the time register() answers, and then
  // "updatefound" has fired before we listened: pick that worker up here.
  track(registration.installing);
  registration.addEventListener("updatefound", () => track(registration.installing));
  // An installed app can stay open for days without a reload: look for news whenever it comes back.
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") registration.update().catch(() => undefined);
  });
}

if ("serviceWorker" in navigator) {
  if (import.meta.env.PROD) {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("/sw.js")
        .then(watchForUpdates)
        .catch(() => undefined);
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
