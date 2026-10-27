// Offers "Add to home screen" on phones (design/components/Toast.md).
// Android/Chrome lets us open the install dialog; iPhone doesn't, so there we only explain the steps.
import { isIos, shouldOfferInstall } from "../lib/pwa";
import { hideToast, isToastOpen, showToast, type ToastContent } from "./toast";

const DISMISSED_KEY = "toolito-install-dismissed";
const OFFER_DELAY_MS = 8000; // Let the page greet people first.

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
}

// sessionStorage: forgotten when the tab closes, so nothing lasting is stored.
function wasDismissed(): boolean {
  try {
    return sessionStorage.getItem(DISMISSED_KEY) === "1";
  } catch {
    return false;
  }
}

function dismiss(): void {
  try {
    sessionStorage.setItem(DISMISSED_KEY, "1");
  } catch {
    // Storage blocked: the offer may come back on the next page, which is fine.
  }
}

const isStandalone = (): boolean =>
  matchMedia("(display-mode: standalone)").matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;

function offer(content: ToastContent): void {
  window.setTimeout(() => {
    const context = { standalone: isStandalone(), touch: matchMedia("(pointer: coarse)").matches, dismissed: wasDismissed() };
    // An update notice that is already open has priority.
    if (shouldOfferInstall(context) && !isToastOpen()) showToast(content);
  }, OFFER_DELAY_MS);
}

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault(); // Keep the browser's own banner away; we ask at a better moment.
  const install = event as InstallPromptEvent;
  offer({
    title: "Keep Toolito at home",
    text: "Add it to your home screen and it opens like an app, even offline.",
    actions: [
      { label: "Add to home screen", primary: true, onSelect: () => void install.prompt() },
      { label: "Not now", onSelect: dismiss },
    ],
  });
});

window.addEventListener("appinstalled", hideToast);

if (isIos(navigator)) {
  offer({
    title: "Keep Toolito at home",
    text: 'Tap the Share button, then "Add to Home Screen".',
    actions: [{ label: "Got it", primary: true, onSelect: dismiss }],
  });
}
