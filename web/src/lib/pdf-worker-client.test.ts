import { afterEach, beforeEach, expect, test, vi } from "vitest";

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

test("a worker that fails to load rejects the waiting request instead of hanging", async () => {
  const { countPagesInWorker } = await import("./pdf-worker-client");
  const waiting = countPagesInWorker(new ArrayBuffer(8));
  FakeWorker.instances[0].dispatchEvent(new Event("error"));

  await expect(waiting).rejects.toThrow(/could not start/);
  expect(FakeWorker.instances[0].terminated).toBe(true);
});

test("after a failure the next request starts a fresh worker", async () => {
  const { countPagesInWorker } = await import("./pdf-worker-client");
  const first = countPagesInWorker(new ArrayBuffer(8));
  FakeWorker.instances[0].dispatchEvent(new Event("error"));
  await first.catch(() => undefined);

  void countPagesInWorker(new ArrayBuffer(8));
  expect(FakeWorker.instances).toHaveLength(2);
});
