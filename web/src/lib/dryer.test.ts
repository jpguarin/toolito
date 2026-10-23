import { describe, expect, test } from "vitest";

import {
  checkBeforeUpload,
  compressedName,
  CYCLES,
  elapsedLabel,
  errorFromApi,
  MAX_PDF_BYTES,
  networkError,
  OUT_OF_ORDER,
} from "./dryer";

const blob = (text: string, padTo = 0) => new Blob([text, new Uint8Array(Math.max(0, padTo - text.length))]);

describe("checkBeforeUpload", () => {
  test("a small real PDF passes", async () => {
    expect(await checkBeforeUpload(blob("%PDF-1.7\n..."))).toBeNull();
  });

  test("over 30 MB is too heavy, before reading anything", async () => {
    expect(await checkBeforeUpload(blob("%PDF-", MAX_PDF_BYTES + 1))).toBe("file_too_large");
  });

  test("exactly 30 MB is still fine", async () => {
    expect(await checkBeforeUpload(blob("%PDF-", MAX_PDF_BYTES))).toBeNull();
  });

  test("a renamed photo is not a PDF", async () => {
    expect(await checkBeforeUpload(new Blob([new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00])]))).toBe("not_a_pdf");
  });

  test("an empty file is not a PDF", async () => {
    expect(await checkBeforeUpload(new Blob([]))).toBe("not_a_pdf");
  });
});

describe("errorFromApi", () => {
  test.each(["file_too_large", "too_many_pages", "not_a_pdf", "encrypted_pdf", "corrupted_pdf", "rate_limited", "processing_timeout"])(
    "%s keeps its code",
    (code) => {
      expect(errorFromApi(code)).toBe(code);
    },
  );

  test.each(["invalid_level", "missing_file", "internal_error", undefined, 42])("%j becomes internal_error", (code) => {
    expect(errorFromApi(code)).toBe("internal_error");
  });
});

test("no response: offline only when the browser is offline", () => {
  expect(networkError(false)).toBe("offline");
  expect(networkError(true)).toBe("internal_error");
});

test("every error card has an LED code, a title, a body and one action", () => {
  for (const card of Object.values(OUT_OF_ORDER)) {
    expect(card.led).toMatch(/^[A-Z0-9 -]+$/);
    expect(card.title.length).toBeGreaterThan(0);
    expect(card.body.length).toBeGreaterThan(0);
    expect(card.action.label.length).toBeGreaterThan(0);
    // OutOfOrder.md: the glass shows either an icon or a taped note.
    expect(Boolean(card.icon) !== Boolean(card.note)).toBe(true);
  }
});

test("cycles map to the API levels, Normal in the middle", () => {
  expect(CYCLES.map((cycle) => `${cycle.name}=${cycle.value}`)).toEqual(["Delicate=low", "Normal=recommended", "Heavy duty=extreme"]);
});

test.each([
  ["informe.pdf", "informe-compressed.pdf"],
  ["Report.PDF", "Report-compressed.pdf"],
  [".pdf", "document-compressed.pdf"],
])("compressedName(%j) = %j", (input, output) => {
  expect(compressedName(input)).toBe(output);
});

test.each([
  [0, "0:00"],
  [12_400, "0:12"],
  [61_000, "1:01"],
  [-5, "0:00"],
])("elapsedLabel(%i) = %s", (ms, label) => {
  expect(elapsedLabel(ms)).toBe(label);
});
