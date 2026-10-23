/// <reference lib="webworker" />
// Washes images off the main thread: decoding a 12 MP photo means ~48 MB of
// raw pixels, far too heavy for the page itself (CLAUDE.md: Web Workers).
import type { ImageRequest, ImageResponse } from "../lib/image-worker-client";
import { ImageError, washImage } from "../lib/image-codecs";

declare const self: DedicatedWorkerGlobalScope;

self.addEventListener("message", async (event: MessageEvent<ImageRequest>) => {
  const { id, bytes, input, settings } = event.data;
  try {
    const result = await washImage(bytes, input, settings);
    const response: ImageResponse = { id, ok: true, ...result };
    self.postMessage(response, [result.bytes]);
  } catch (error) {
    const response: ImageResponse = {
      id,
      ok: false,
      message: error instanceof ImageError ? error.message : "This image could not be washed.",
    };
    self.postMessage(response);
  }
});
