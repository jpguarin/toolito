import { afterEach, beforeEach, expect, test, vi } from "vitest";

const settings = { format: "same", quality: 75, resize: false } as const;

class FakeWorker extends EventTarget {
  static instances: FakeWorker[] = [];
  terminated = false;
  constructor() {
    super();
    FakeWorker.instances.push(this);
  }
  postMessage(): void {}
  terminate(): void {
    this.terminated = true;
  }
}

beforeEach(() => {
  FakeWorker.instances = [];
  vi.stubGlobal("Worker", FakeWorker);
  vi.resetModules(); // the client keeps its worker in module state
});

afterEach(() => {
  vi.unstubAllGlobals();
});

test("a worker that fails to load fails the waiting request instead of hanging", async () => {
  const { washInWorker } = await import("./image-worker-client");
  const waiting = washInWorker(new ArrayBuffer(8), "jpeg", settings);
  FakeWorker.instances[0].dispatchEvent(new Event("error"));

  const response = await waiting;
  expect(response.ok).toBe(false);
  expect(FakeWorker.instances[0].terminated).toBe(true);
});

test("after a failure the next request starts a fresh worker", async () => {
  const { washInWorker } = await import("./image-worker-client");
  const first = washInWorker(new ArrayBuffer(8), "jpeg", settings);
  FakeWorker.instances[0].dispatchEvent(new Event("error"));
  await first;

  void washInWorker(new ArrayBuffer(8), "jpeg", settings);
  expect(FakeWorker.instances).toHaveLength(2);
});
