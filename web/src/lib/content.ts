// Instructions and FAQ for every tool page, as data: one place to edit, one
// component to show them (ToolGuide.astro). Rule from HouseRules.md: never
// promise more than the code does. Facts used below are checked in content.test.ts.
import { type Conversion } from "./conversions";
import { MAX_PDF_BYTES, MAX_PDF_PAGES } from "./dryer";
import { FORMAT_LABEL } from "./image";

export interface ToolGuide {
  steps: [string, string, string]; // "How the machine works": exactly three.
  faq: { question: string; answer: string }[];
}

const MAX_MB = MAX_PDF_BYTES / (1024 * 1024);

const OFFLINE = "Yes. Once you have opened Toolito with internet, this machine keeps working without a connection.";
const FREE = "Yes. No coins, no sign-up and no watermarks.";

export const GUIDES = {
  "compress-image": {
    steps: [
      "Drop your JPG, PNG, WebP or AVIF images in the washer, as many as you like.",
      "Pick an output format and a quality. WebP at 75 is a good everyday cycle.",
      "Take each image home, or all of them in one ZIP.",
    ],
    faq: [
      { question: "Are my images uploaded anywhere?", answer: "No. They are compressed on your own device; nothing leaves the building." },
      { question: "Which format should I pick?", answer: "WebP gives small files that every modern browser shows. AVIF is even smaller but slower to wash. JPG opens everywhere. PNG is lossless and keeps transparency." },
      { question: "What does quality change?", answer: "Lower quality means a smaller file with softer details. Around 75 most photos look the same as the original. PNG ignores it because it is lossless." },
      { question: "What if an image does not get smaller?", answer: "If the result is not lighter in the same format, you get your original back, marked “Already clean”." },
      { question: "Can I make big photos smaller in size too?", answer: "Yes: tick “Resize to fit 1920 px”. Smaller photos are never enlarged." },
      { question: "Is it free?", answer: FREE },
      { question: "Does it work offline?", answer: OFFLINE },
    ],
  },
  "convert-image": {
    steps: [
      "Drop your JPG, PNG, WebP or AVIF images in the washer.",
      "Pick the format you need: WebP, AVIF, JPG or PNG.",
      "Take each image home, or all of them in one ZIP.",
    ],
    faq: [
      { question: "Are my images uploaded anywhere?", answer: "No. They are converted on your own device." },
      { question: "Why did my image get bigger?", answer: "Some formats are heavier: PNG is lossless, so a photo converted to PNG usually grows. That is normal for the dye machine." },
      { question: "Does it keep transparency?", answer: "PNG, WebP and AVIF keep it. JPG has no transparency, so pick one of the others for logos and icons." },
      { question: "Can I convert many images at once?", answer: "Yes. They are washed one at a time so your device does not run out of memory, and you can take them all home in one ZIP." },
      { question: "Is it free?", answer: FREE },
      { question: "Does it work offline?", answer: OFFLINE },
    ],
  },
  "compress-pdf": {
    steps: [
      `Drop one PDF in the dryer, up to ${MAX_MB} MB and ${MAX_PDF_PAGES} pages.`,
      "Pick a cycle: Delicate, Normal or Heavy duty.",
      "Start the dryer and take your lighter PDF home.",
    ],
    faq: [
      { question: "Is my PDF uploaded?", answer: "Yes — the dryer is the one machine that runs on our server. Your PDF is compressed and deleted right after the load; we never keep it." },
      { question: "Will the text still be selectable?", answer: "Yes. Only the photos inside the PDF are recompressed; text and drawings are left untouched." },
      { question: "Which cycle should I choose?", answer: "Delicate keeps the best quality for printing, Normal is email-ready, and Heavy duty gives the smallest file with softer photos." },
      { question: "Why did my PDF barely shrink?", answer: "If it has few photos, or they are already compressed, there is little to squeeze. If the result would be bigger, you get your original back." },
      { question: "What are the limits?", answer: `Up to ${MAX_MB} MB and ${MAX_PDF_PAGES} pages per load. For bigger files, split them first on the clothesline.` },
      { question: "Can it open password-protected PDFs?", answer: "No. Remove the password in your PDF reader, then drop the file in again." },
      { question: "Is it free?", answer: FREE },
    ],
  },
  "merge-pdf": {
    steps: [
      "Drop your PDFs on the folding table.",
      "Put them in order with the arrows. Top of the pile = first pages.",
      "Fold them into one and take the PDF home.",
    ],
    faq: [
      { question: "Are my PDFs uploaded anywhere?", answer: "No. They are merged on your own device; the table is in your browser." },
      { question: "Can I change the order?", answer: "Yes, with the arrows on each row, or with the arrow keys on a selected row." },
      { question: "Is there a size limit?", answer: "Only your device's memory. Very large PDFs may take a moment." },
      { question: "Can it merge password-protected PDFs?", answer: "No. Remove the password first, then put them on the table again." },
      { question: "Is it free?", answer: FREE },
      { question: "Does it work offline?", answer: OFFLINE },
    ],
  },
  "split-pdf": {
    steps: [
      "Hang your PDF on the clothesline.",
      "Pin the pages you need, type ranges like 1-3, 8, or choose Every page.",
      "Take down one PDF, one per range, or every page in a ZIP.",
    ],
    faq: [
      { question: "Is my PDF uploaded anywhere?", answer: "No. It is split on your own device." },
      { question: "How do I write page ranges?", answer: "Use numbers and dashes separated by commas, like 1-3, 8. Typing and pinning pages stay in sync." },
      { question: "Can I get every page as its own file?", answer: "Yes. Choose Every page and you take home one PDF per page, all in one ZIP." },
      { question: "Can it split password-protected PDFs?", answer: "No. Remove the password first, then hang the PDF again." },
      { question: "Is it free?", answer: FREE },
      { question: "Does it work offline?", answer: OFFLINE },
    ],
  },
} satisfies Record<string, ToolGuide>;

export type ToolId = keyof typeof GUIDES;

/** /jpg-to-webp style pages: the same answers, written for the exact pair. */
export function conversionGuide({ from, to }: Pick<Conversion, "from" | "to">): ToolGuide {
  const a = FORMAT_LABEL[from];
  const b = FORMAT_LABEL[to];
  return {
    steps: [`Drop your ${a} images in the washer.`, `They come out as ${b}; change the quality if you like.`, "Take each image home, or all of them in one ZIP."],
    faq: [
      { question: `Are my ${a} images uploaded anywhere?`, answer: `No. They are converted to ${b} on your own device.` },
      {
        question: `Will the ${b} files be smaller?`,
        answer:
          to === "png"
            ? "Not always: PNG is lossless, so photos usually get bigger. It is the right choice for sharp graphics and transparency."
            : `Usually, yes. ${b} tends to be lighter than ${a} at a similar quality.`,
      },
      { question: "Can I convert many at once?", answer: "Yes, and take them all home in one ZIP." },
      { question: "Is it free?", answer: FREE },
      { question: "Does it work offline?", answer: OFFLINE },
    ],
  };
}

/** schema.org FAQPage, so search engines can read the questions (JSON-LD). */
export function faqJsonLd(faq: ToolGuide["faq"]): string {
  const data = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map(({ question, answer }) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: { "@type": "Answer", text: answer },
    })),
  };
  // Escape "<" so no text can ever close the <script> tag early.
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
