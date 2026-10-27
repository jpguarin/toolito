// Pure helpers for the install / update toasts (see design/components/Toast.md).

interface DeviceInfo {
  userAgent: string;
  platform: string;
  maxTouchPoints: number;
}

/** iPhone and iPad. iPadOS 13+ says it is a Mac, but a Mac has no touch screen. */
export function isIos({ userAgent, platform, maxTouchPoints }: DeviceInfo): boolean {
  if (/iPhone|iPad|iPod/.test(userAgent)) return true;
  return platform === "MacIntel" && maxTouchPoints > 1;
}

interface InstallContext {
  standalone: boolean; // Already opened from the home screen.
  touch: boolean; // Phones and tablets only.
  dismissed: boolean; // Closed earlier in this session.
}

/** The install offer is for touch devices that haven't installed or dismissed it. */
export function shouldOfferInstall({ standalone, touch, dismissed }: InstallContext): boolean {
  return touch && !standalone && !dismissed;
}
