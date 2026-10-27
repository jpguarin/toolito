import { describe, expect, test } from "vitest";

import { isIos, shouldOfferInstall } from "./pwa";

const iphone = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Version/17.0 Mobile/15E148 Safari/604.1";
const android = "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 Chrome/120.0 Mobile Safari/537.36";

describe("isIos", () => {
  test("detects iPhone", () => {
    expect(isIos({ userAgent: iphone, platform: "iPhone", maxTouchPoints: 5 })).toBe(true);
  });

  test("detects iPadOS posing as a Mac", () => {
    expect(isIos({ userAgent: "Macintosh", platform: "MacIntel", maxTouchPoints: 5 })).toBe(true);
  });

  test("a real Mac and Android are not iOS", () => {
    expect(isIos({ userAgent: "Macintosh", platform: "MacIntel", maxTouchPoints: 0 })).toBe(false);
    expect(isIos({ userAgent: android, platform: "Linux armv8l", maxTouchPoints: 5 })).toBe(false);
  });
});

describe("shouldOfferInstall", () => {
  test("offers on a touch device that has not installed or dismissed", () => {
    expect(shouldOfferInstall({ standalone: false, touch: true, dismissed: false })).toBe(true);
  });

  test.each([
    { standalone: true, touch: true, dismissed: false },
    { standalone: false, touch: false, dismissed: false },
    { standalone: false, touch: true, dismissed: true },
  ])("stays quiet for %j", (context) => {
    expect(shouldOfferInstall(context)).toBe(false);
  });
});
