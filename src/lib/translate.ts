import { nativeNameFor } from "@/lib/languages";
import { detectLanguage } from "@/lib/news-brief";
import type { Language, Mention } from "@/types";

const CODES: Record<Language, string> = {
  Hindi: "hi",
  Tamil: "ta",
  Telugu: "te",
  Marathi: "mr",
  Bengali: "bn",
  Gujarati: "gu",
  Malayalam: "ml",
  English: "en",
};

export type TextBase = {
  language: Language;
  ocrText: string;
  translation: string;
  summary: string;
  headline: string;
};

const memory = new Map<string, string>();

function splitChunks(text: string, max: number) {
  const sentences = text.split(/(?<=[.!?।])\s+/);
  const chunks: string[] = [];
  let current = "";
  for (const sentence of sentences) {
    const piece = sentence.trim();
    if (!piece) continue;
    if ((current ? `${current} ${piece}` : piece).length > max) {
      if (current) chunks.push(current);
      if (piece.length > max) {
        for (let index = 0; index < piece.length; index += max) chunks.push(piece.slice(index, index + max));
        current = "";
      } else {
        current = piece;
      }
    } else {
      current = current ? `${current} ${piece}` : piece;
    }
  }
  if (current) chunks.push(current);
  return chunks.length ? chunks : [text.trim()];
}

function decodeEntities(value: string) {
  return value
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number(code)))
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

/** Translate page text. Same-language input is returned as-is. */
export async function translateText(text: string, from: Language, to: Language) {
  const source = text.trim();
  if (!source || from === to) return source;
  const key = `${from}|${to}|${source}`;
  const saved = memory.get(key);
  if (saved) return saved;

  const parts = splitChunks(source, 400);
  const translated: string[] = [];
  for (const part of parts) {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(part)}&langpair=${CODES[from]}|${CODES[to]}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Translation failed.");
    const data = (await response.json()) as {
      responseStatus?: number;
      responseData?: { translatedText?: string };
    };
    const value = data.responseData?.translatedText?.trim();
    if (!value || data.responseStatus !== 200 || /MYMEMORY WARNING|QUERY LENGTH/i.test(value)) {
      throw new Error("Translation failed.");
    }
    translated.push(decodeEntities(value));
  }
  const joined = translated.join(" ");
  memory.set(key, joined);
  return joined;
}

export function textBaseOf(mention: Mention): TextBase {
  if (mention.textBase) return mention.textBase;
  const ocrText = mention.ocrText;
  const translation = mention.translation || mention.summary;
  return {
    language: detectLanguage(ocrText).language,
    ocrText,
    translation,
    summary: mention.summary,
    headline: mention.headline,
  };
}

/** OCR, translation, summary, and headline in the language the desk picked. */
export async function renderInLanguage(mention: Mention, next: Language): Promise<Partial<Mention>> {
  const base = textBaseOf(mention);
  const bodySource = next === base.language ? base.ocrText : base.translation || base.ocrText;
  const bodyFrom = detectLanguage(bodySource).language;
  const summaryFrom = detectLanguage(base.summary).language;
  const headlineFrom = detectLanguage(base.headline).language;
  const [body, summary, headline] = await Promise.all([
    translateText(bodySource.slice(0, 1200), bodyFrom, next),
    translateText(base.summary, summaryFrom, next),
    translateText(base.headline, headlineFrom, next),
  ]);
  const reviewFlag = mention.reviewFlag?.includes("short word list") ? undefined : mention.reviewFlag;
  return {
    textBase: base,
    language: next,
    nativeName: nativeNameFor(next),
    ocrText: body,
    translation: body,
    summary,
    headline,
    nativeHeadline: headline,
    reviewFlag,
  };
}
