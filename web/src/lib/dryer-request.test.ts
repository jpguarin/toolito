import { describe, expect, test, vi } from "vitest";

// astro:env only exists inside Astro; give the test a fixed URL instead.
vi.mock("astro:env/client", () => ({ PUBLIC_API_URL: "http://api.test" }));

const { readFailure, readSuccess } = await import("./dryer-request");

const headers =
  (values: Record<string, string>) =>
  (name: string): string | null =>
    values[name] ?? null;

describe("readSuccess", () => {
  test("reads the sizes and the already-optimized flag from the headers", () => {
    const pdf = new Blob(["%PDF-"]);
    expect(readSuccess(pdf, headers({ "X-Original-Size": "5242880", "X-Compressed-Size": "1310720", "X-Already-Optimized": "false" }))).toEqual({
      ok: true,
      result: pdf,
      originalSize: 5242880,
      compressedSize: 1310720,
      alreadyOptimized: false,
    });
  });

  test("falls back to the blob size if CORS hid the headers", () => {
    const pdf = new Blob(["%PDF-1.7"]);
    const outcome = readSuccess(pdf, headers({}));
    expect(outcome).toMatchObject({ ok: true, originalSize: pdf.size, compressedSize: pdf.size, alreadyOptimized: false });
  });
});

describe("readFailure", () => {
  const json = (code: string) => JSON.stringify({ error: { code, message: "…" } });

  test.each([
    [413, "file_too_large"],
    [415, "not_a_pdf"],
    [422, "encrypted_pdf"],
    [422, "corrupted_pdf"],
    [422, "too_many_pages"],
  ])("%i %s", (status, code) => {
    expect(readFailure(status, json(code), null)).toEqual({ ok: false, code });
  });

  test("rate limited uses Retry-After, or 60 s if it is missing", () => {
    expect(readFailure(429, json("rate_limited"), "42")).toEqual({ ok: false, code: "rate_limited", retryAfter: 42 });
    expect(readFailure(429, json("rate_limited"), null)).toEqual({ ok: false, code: "rate_limited", retryAfter: 60 });
  });

  test("a 504 without a JSON body is a timeout", () => {
    expect(readFailure(504, "<html>Gateway Timeout</html>", null)).toEqual({ ok: false, code: "processing_timeout" });
  });

  test("anything we do not recognise is our fault", () => {
    expect(readFailure(500, json("internal_error"), null)).toEqual({ ok: false, code: "internal_error" });
    expect(readFailure(400, json("invalid_level"), null)).toEqual({ ok: false, code: "internal_error" });
    expect(readFailure(502, "not json", null)).toEqual({ ok: false, code: "internal_error" });
  });
});
