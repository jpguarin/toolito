import { describe, expect, test } from "vitest";

import { conversionGuide, faqJsonLd, GUIDES } from "./content";
import { CONVERSIONS } from "./conversions";

const allGuides = [...Object.values(GUIDES), ...CONVERSIONS.map(conversionGuide)];

test("every page has three steps and at least four questions", () => {
  for (const guide of allGuides) {
    expect(guide.steps).toHaveLength(3);
    expect(guide.faq.length).toBeGreaterThanOrEqual(4);
  }
});

test("questions end with a question mark and answers are full sentences", () => {
  for (const { faq } of allGuides) {
    for (const { question, answer } of faq) {
      expect(question.endsWith("?")).toBe(true);
      expect(answer).toMatch(/[.!]$/);
    }
  }
});

describe("never promise more than the code does", () => {
  test("only the dryer says files are uploaded", () => {
    for (const [tool, guide] of Object.entries(GUIDES)) {
      const first = guide.faq[0].answer;
      expect(first.startsWith(tool === "compress-pdf" ? "Yes" : "No")).toBe(true);
    }
  });

  test("the dryer states the real limits", () => {
    const text = JSON.stringify(GUIDES["compress-pdf"]);
    expect(text).toContain("30 MB");
    expect(text).toContain("500 pages");
  });

  test("the dryer never offers offline use", () => {
    expect(JSON.stringify(GUIDES["compress-pdf"])).not.toMatch(/offline/i);
  });
});

test("conversion pages name their formats", () => {
  const guide = conversionGuide({ from: "jpeg", to: "webp" });
  expect(guide.steps[0]).toContain("JPG");
  expect(guide.faq[0].answer).toContain("WebP");
});

describe("faqJsonLd", () => {
  test("is valid schema.org FAQPage JSON", () => {
    const data = JSON.parse(faqJsonLd([{ question: "Q?", answer: "A." }]));
    expect(data["@type"]).toBe("FAQPage");
    expect(data.mainEntity[0]).toEqual({ "@type": "Question", name: "Q?", acceptedAnswer: { "@type": "Answer", text: "A." } });
  });

  test("cannot close the script tag early", () => {
    expect(faqJsonLd([{ question: "</script><b>?", answer: "x." }])).not.toContain("</script>");
  });
});
