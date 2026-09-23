import { TODAY } from "@/data/mock";
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

function labelFromFile(name: string) {
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

/** Sample chain so an uploaded PDF can open in Digital Twin before a live read exists. */
export function buildUploadedMention(file: File, previewUrl: string): Mention {
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
    language: "English",
    nativeName: "English",
    sentiment: "neutral",
    confidence: 90,
    reviewFlag: "Sample text for this demo. The PDF was not read; a live desk would replace this with the scan.",
    headline: `${label} is ready to trace`,
    nativeHeadline: label,
    summary: `${file.name} was added from this browser. The alert, translation, and OCR steps use sample text so the chain can be opened now. The original PDF is attached to the page.`,
    translation: `${label} was added as a PDF. This English paragraph is sample translation, so the desk can walk alert, translation, OCR, and the original page before a live read is connected. Figures on the printed page are not claimed here. The brand keyword PayU is marked the way a real alert would mark it.`,
    ocrText: `Sample OCR for ${file.name}. The uploaded PDF is attached on the original-page step. A live desk would replace this paragraph with the text read from the scan.`,
    pageNumber: 1,
    edition: "Upload",
    column: "Uploaded PDF",
    publishedAt: stamp,
    detectedAt: stamp,
    latencyMinutes: 1,
    sourceKind: "epaper",
    channels: ["email"],
    keywords: ["PayU"],
    fileName: file.name,
    previewUrl,
    sampleTrace: true,
  };
}
