import { TODAY } from "@/data/mock";
import { detectLanguage, type NewsBrief } from "@/lib/news-brief";
import type { Mention } from "@/types";

const MAX_PDF_BYTES = 32 * 1024 * 1024;

export function pdfSizeLimit() {
  return MAX_PDF_BYTES;
}

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  const mb = bytes / (1024 * 1024);
  return `${mb >= 10 ? mb.toFixed(0) : mb.toFixed(1)} MB`;
}

/** True when the header of the file contains a PDF signature. */
export async function hasPdfSignature(file: File) {
  if (file.size < 5) return false;
  const slice = new Uint8Array(await file.slice(0, 1024).arrayBuffer());
  let head = "";
  for (let i = 0; i < slice.length; i += 1) head += String.fromCharCode(slice[i]);
  return head.includes("%PDF-");
}

export function isAllowedPdfCandidate(file: File) {
  const ext = file.name.toLowerCase().endsWith(".pdf");
  const mime = file.type;
  if (mime.startsWith("image/") || mime.startsWith("video/") || mime.startsWith("audio/")) return false;
  if (ext) return true;
  return mime === "application/pdf" || mime === "application/x-pdf";
}

export function labelFromFile(name: string) {
  const stem = name
    .replace(/\.pdf$/i, "")
    .replace(/[_\-.]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (stem.length < 2) return "Uploaded ePaper";
  return stem.replace(/\b([a-z])/g, (letter) => letter.toUpperCase());
}

function deskStamp(now = new Date()) {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${TODAY}T${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
}

/** A mention built from the text actually read out of the uploaded PDF. */
export function buildUploadedMention(file: File, previewUrl: string, brief: NewsBrief): Mention {
  const label = labelFromFile(file.name);
  const suffix =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().slice(0, 8)
      : Date.now().toString(36);
  const id = `upl-${suffix}`;
  const stamp = deskStamp();

  return {
    id,
    chain: {
      pageId: `page_upload_${suffix}`,
      ocrId: `ocr_upload_${suffix}`,
      translationId: `tr_upload_${suffix}`,
      alertId: `alert_upload_${suffix}`,
    },
    brand: "PayU",
    publication: label,
    masthead: label,
    city: "Desk upload",
    language: brief.language,
    nativeName: brief.nativeName,
    sentiment: brief.sentiment,
    confidence: brief.confidence,
    reviewFlag: brief.reviewFlag,
    headline: brief.headline,
    nativeHeadline: brief.headline,
    summary: brief.summary,
    translation: brief.summary,
    ocrText: brief.sourceText || `No selectable text was found in ${file.name}.`,
    pageNumber: 1,
    edition: "Upload",
    column: "Uploaded PDF",
    publishedAt: stamp,
    detectedAt: stamp,
    latencyMinutes: 1,
    sourceKind: "epaper",
    channels: ["email"],
    keywords: brief.keywords,
    fileName: file.name,
    previewUrl,
    sampleTrace: true,
    textBase: {
      language: detectLanguage(brief.sourceText || brief.summary).language,
      ocrText: brief.sourceText || brief.summary,
      translation: brief.summary,
      summary: brief.summary,
      headline: brief.headline,
    },
  };
}
