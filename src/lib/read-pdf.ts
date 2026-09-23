import { ocrCodeFor } from "@/lib/languages";
import { labelFromFile } from "@/lib/uploaded-mention";
import { briefFromText, normalizePageText, type NewsBrief } from "@/lib/news-brief";
import type { Language } from "@/types";

const MAX_PAGES = 8;
const MAX_CHARS = 20000;

function workerSrc() {
  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  return `${base}/pdf.worker.min.mjs`;
}

function withTimeout<T>(work: Promise<T>, ms: number) {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("timed out")), ms);
    work.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error: unknown) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

function wordCount(text: string) {
  return text.split(/\s+/).filter((token) => token.length > 1).length;
}

type Pdfjs = typeof import("pdfjs-dist");

async function loadPdfjs(): Promise<Pdfjs> {
  const pdfjs = await import("pdfjs-dist");
  if (typeof window !== "undefined") {
    pdfjs.GlobalWorkerOptions.workerSrc = workerSrc();
  }
  return pdfjs;
}

async function textFromPdf(file: File) {
  const pdfjs = await loadPdfjs();
  const data = new Uint8Array(await file.arrayBuffer());
  const pdf = await pdfjs.getDocument({ data }).promise;
  const parts: string[] = [];
  const pages = Math.min(pdf.numPages, MAX_PAGES);
  for (let index = 1; index <= pages; index += 1) {
    const page = await pdf.getPage(index);
    const content = await page.getTextContent();
    const lines: string[] = [];
    let current: string[] = [];
    let lastY: number | null = null;
    for (const item of content.items) {
      if (!("str" in item) || !item.str) continue;
      const y = item.transform[5];
      if (lastY !== null && Math.abs(y - lastY) > 2) {
        lines.push(current.join(" "));
        current = [];
      }
      current.push(item.str);
      lastY = y;
    }
    if (current.length) lines.push(current.join(" "));
    parts.push(lines.join("\n"));
    if (parts.join("\n").length >= MAX_CHARS) break;
  }
  const text = normalizePageText(parts.join("\n")).slice(0, MAX_CHARS);
  return { pdf, text };
}

async function ocrThinPage(pdf: Awaited<ReturnType<typeof textFromPdf>>["pdf"], code: string) {
  const { createWorker } = await import("tesseract.js");
  const worker = await createWorker(code);
  try {
    const chunks: string[] = [];
    let confidenceSum = 0;
    let seen = 0;
    const pages = Math.min(pdf.numPages, 2);
    for (let index = 1; index <= pages; index += 1) {
      const page = await pdf.getPage(index);
      const base = page.getViewport({ scale: 1 });
      const scale = Math.min(1.7, 1600 / Math.max(base.width, 1));
      const viewport = page.getViewport({ scale });
      const canvas = document.createElement("canvas");
      canvas.width = Math.ceil(viewport.width);
      canvas.height = Math.ceil(viewport.height);
      const context = canvas.getContext("2d", { willReadFrequently: true });
      if (!context) continue;
      await page.render({ canvasContext: context, viewport }).promise;
      const result = await worker.recognize(canvas);
      chunks.push(result.data.text ?? "");
      confidenceSum += result.data.confidence ?? 0;
      seen += 1;
      if (wordCount(chunks.join(" ")) > 120) break;
    }
    if (!seen) return null;
    return {
      text: chunks.join("\n"),
      confidence: Math.max(0.15, Math.min(0.95, confidenceSum / seen / 100)),
    };
  } finally {
    await worker.terminate();
  }
}

/** Read an ePaper PDF in the browser and score the article. Image-only pages fall back to OCR. */
export async function readNewsBrief(file: File, language?: Language): Promise<NewsBrief> {
  const label = labelFromFile(file.name);
  const { pdf, text } = await textFromPdf(file);
  try {
    let body = text;
    let readQuality: number | undefined;
    if (wordCount(text) < 40) {
      try {
        const ocr = await withTimeout(ocrThinPage(pdf, language ? ocrCodeFor(language) : "eng+hin"), 40000);
        if (ocr && wordCount(ocr.text) > wordCount(text)) {
          body = ocr.text;
          readQuality = ocr.confidence;
        }
      } catch {
        body = text;
      }
    }
    return briefFromText(body, label, readQuality, language);
  } finally {
    await pdf.destroy();
  }
}
