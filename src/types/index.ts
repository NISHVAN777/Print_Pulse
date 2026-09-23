export type Sentiment = "positive" | "neutral" | "negative";

export type Language =
  | "Hindi"
  | "Tamil"
  | "Telugu"
  | "Marathi"
  | "Bengali"
  | "Gujarati"
  | "Malayalam"
  | "English";

export type SourceKind = "epaper" | "email-clipping";

export type AlertChannel = "whatsapp" | "slack" | "email";

/** One link in the Digital Twin chain of custody. */
export type TwinStage = "alert" | "translation" | "ocr" | "page";

export interface Mention {
  id: string;
  /** page → ocr → translation → alert, the model from the execution plan. */
  chain: {
    pageId: string;
    ocrId: string;
    translationId: string;
    alertId: string;
  };
  brand: string;
  publication: string;
  masthead: string;
  city: string;
  language: Language;
  nativeName: string;
  sentiment: Sentiment;
  confidence: number;
  /** OCR or translation span the model is not willing to stand behind. */
  reviewFlag?: string;
  headline: string;
  nativeHeadline: string;
  summary: string;
  translation: string;
  ocrText: string;
  pageNumber: number;
  edition: string;
  column: string;
  publishedAt: string;
  detectedAt: string;
  latencyMinutes: number;
  sourceKind: SourceKind;
  channels: AlertChannel[];
  keywords: string[];
  /** Set when the page was added from the upload dialog. */
  fileName?: string;
  /** Session-only blob URL for the uploaded PDF. */
  previewUrl?: string;
  /** OCR and translation are sample text, not a read of the file. */
  sampleTrace?: boolean;
}

/** A PDF added from the desk during this browser session. */
export interface UploadRecord {
  id: string;
  fileName: string;
  sizeBytes: number;
  uploadedAt: string;
  mentionId: string;
}

export interface Source {
  id: string;
  publication: string;
  language: Language;
  city: string;
  kind: SourceKind;
  url: string;
  schedule: string;
  status: "connected" | "scanning" | "paused" | "attention";
  lastFetch: string;
  pagesToday: number;
  enabled: boolean;
}

export interface PricingTier {
  id: string;
  name: string;
  price: string;
  cadence: string;
  blurb: string;
  featured?: boolean;
  cta: string;
  features: string[];
}
