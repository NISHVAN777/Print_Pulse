import { nativeNameFor } from "@/lib/languages";
import type { Language, Sentiment } from "@/types";

export type NewsBrief = {
  headline: string;
  summary: string;
  sentiment: Sentiment;
  /** How sure the sentiment label is, from cue strength and how much of the page could be read. */
  confidence: number;
  language: Language;
  nativeName: string;
  reviewFlag?: string;
  sourceText: string;
  keywords: string[];
};

const POSITIVE: Record<string, number> = {
  growth: 2,
  profit: 2,
  profits: 2,
  profitable: 2,
  surge: 2,
  surged: 2,
  success: 2,
  successful: 2,
  praise: 2,
  praised: 2,
  partnership: 2,
  partnerships: 2,
  boost: 2,
  boosted: 2,
  gain: 2,
  gains: 2,
  win: 2,
  wins: 2,
  award: 2,
  innovation: 2,
  expand: 2,
  expansion: 2,
  improved: 2,
  improvement: 2,
  stronger: 2,
  optimistic: 2,
  recovery: 2,
  recovered: 2,
  milestone: 2,
  beneficial: 2,
  reliable: 2,
  celebrate: 2,
  celebrated: 2,
  outperform: 2,
  outpaced: 2,
  welcomed: 2,
  welcome: 2,
  opportunity: 2,
  opportunities: 2,
  soar: 2,
  soared: 2,
  rally: 2,
  rallied: 2,
  cleared: 2,
  record: 1,
  higher: 1,
  better: 1,
  best: 1,
  helped: 1,
  help: 1,
  increase: 1,
  increased: 1,
  positive: 1,
  stable: 1,
  stability: 1,
  agreed: 1,
  approved: 1,
  approval: 1,
  improve: 1,
  rising: 1,
  rose: 1,
  rise: 1,
  वृद्धि: 2,
  लाभ: 2,
  सफलता: 2,
  साझेदारी: 2,
  सुधार: 2,
  बढ़त: 2,
  मजबूत: 2,
  सम्मान: 2,
  बढ़ोतरी: 2,
  வளர்ச்சி: 2,
  லாபம்: 2,
  வெற்றி: 2,
};

const NEGATIVE: Record<string, number> = {
  fraud: 2,
  scam: 2,
  lawsuit: 2,
  sued: 2,
  fined: 2,
  penalty: 2,
  penalties: 2,
  outage: 2,
  failure: 2,
  failed: 2,
  complaint: 2,
  complaints: 2,
  probe: 2,
  banned: 2,
  ban: 2,
  breach: 2,
  hacked: 2,
  hack: 2,
  losses: 2,
  loss: 2,
  decline: 2,
  declined: 2,
  crash: 2,
  crashed: 2,
  crisis: 2,
  scandal: 2,
  allegation: 2,
  allegations: 2,
  alleged: 2,
  defaulted: 2,
  bankrupt: 2,
  bankruptcy: 2,
  layoff: 2,
  layoffs: 2,
  protest: 2,
  protests: 2,
  criticism: 2,
  criticised: 2,
  criticized: 2,
  illegal: 2,
  dispute: 2,
  disputed: 2,
  unpaid: 2,
  suspended: 2,
  suspension: 2,
  investigation: 2,
  investigated: 2,
  cheat: 2,
  cheated: 2,
  misleading: 2,
  unsafe: 2,
  embezzlement: 2,
  embezzled: 2,
  guilty: 2,
  conviction: 2,
  convicted: 2,
  downgrade: 2,
  downgraded: 2,
  weaker: 1,
  concern: 1,
  concerns: 1,
  problem: 1,
  problems: 1,
  slower: 1,
  missed: 1,
  poor: 1,
  worse: 1,
  worst: 1,
  halted: 1,
  halt: 1,
  paused: 1,
  closure: 1,
  worried: 1,
  worry: 1,
  fear: 1,
  fears: 1,
  delay: 1,
  delayed: 1,
  delays: 1,
  glitch: 1,
  glitches: 1,
  warning: 1,
  warned: 1,
  slump: 1,
  slumped: 1,
  fall: 1,
  fell: 1,
  drop: 1,
  dropped: 1,
  lower: 1,
  घोटाला: 2,
  नुकसान: 2,
  गिरावट: 2,
  शिकायत: 2,
  जुर्माना: 2,
  प्रतिबंध: 2,
  जांच: 2,
  संकट: 2,
  धोखा: 2,
  विवाद: 2,
  देरी: 2,
  गिरफ्तारी: 2,
  மோசடி: 2,
  இழப்பு: 2,
  புகார்: 2,
  தடை: 2,
};

const LEXICON: Record<string, number> = {};
for (const [word, weight] of Object.entries(POSITIVE)) LEXICON[word] = weight;
for (const [word, weight] of Object.entries(NEGATIVE)) LEXICON[word] = -weight;

const NEGATORS = new Set([
  "not",
  "no",
  "never",
  "neither",
  "nor",
  "without",
  "hardly",
  "barely",
  "isn't",
  "wasn't",
  "aren't",
  "weren't",
  "don't",
  "doesn't",
  "didn't",
  "won't",
  "can't",
  "cannot",
  "nobody",
  "none",
]);

const BOOST: Record<string, number> = {
  very: 1.4,
  extremely: 1.7,
  highly: 1.4,
  sharply: 1.6,
  significantly: 1.5,
  strongly: 1.4,
  heavily: 1.5,
  slightly: 0.6,
  somewhat: 0.7,
  partly: 0.7,
};

const SCRIPTS: { language: Language; nativeName: string; pattern: RegExp }[] = [
  { language: "Hindi", nativeName: "हिन्दी", pattern: /\p{Script=Devanagari}/gu },
  { language: "Tamil", nativeName: "தமிழ்", pattern: /\p{Script=Tamil}/gu },
  { language: "Telugu", nativeName: "తెలుగు", pattern: /\p{Script=Telugu}/gu },
  { language: "Bengali", nativeName: "বাংলা", pattern: /\p{Script=Bengali}/gu },
  { language: "Gujarati", nativeName: "ગુજરાતી", pattern: /\p{Script=Gujarati}/gu },
  { language: "Malayalam", nativeName: "മലയാളം", pattern: /\p{Script=Malayalam}/gu },
];

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function normalizePageText(raw: string) {
  return raw
    .replace(/\u00ad/g, "")
    .replace(/(\p{L})-\n\s*(?=\p{L})/gu, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

function tokensOf(text: string) {
  return text
    .toLowerCase()
    .replace(/[’‘]/g, "'")
    .split(/[^\p{L}\p{M}\p{N}']+/u)
    .filter(Boolean);
}

function wordCount(text: string) {
  return tokensOf(text).filter((token) => token.length > 1).length;
}

function qualityFromText(text: string) {
  const words = wordCount(text);
  const letters = (text.match(/\p{L}/gu) ?? []).length;
  const ratio = letters / Math.max(text.length, 1);
  if (words < 8 || ratio < 0.35) return 0.22;
  if (words < 20) return 0.66;
  if (words < 40 || ratio < 0.5) return 0.78;
  if (ratio < 0.62) return 0.84;
  return 0.93;
}

export function detectLanguage(text: string): { language: Language; nativeName: string } {
  const latin = (text.match(/\p{Script=Latin}/gu) ?? []).length;
  let best: { language: Language; nativeName: string; count: number } = {
    language: "English",
    nativeName: "English",
    count: latin,
  };
  for (const script of SCRIPTS) {
    const count = (text.match(script.pattern) ?? []).length;
    if (count > best.count) best = { language: script.language, nativeName: script.nativeName, count };
  }
  if (best.language === "Hindi") {
    const marathi = (text.match(/(?:^|\s)(?:आहे|आणि|मध्ये|साठी)(?=\s|$)/g) ?? []).length;
    const hindi = (text.match(/(?:^|\s)(?:है|और|नहीं)(?=\s|$)/g) ?? []).length;
    if (marathi > hindi) return { language: "Marathi", nativeName: "मराठी" };
  }
  return { language: best.language, nativeName: best.nativeName };
}

function scoreTokens(tokens: string[]) {
  const pivot = tokens.findIndex((token) => token === "but" || token === "however");
  let armed = 0;
  let boost = 1;
  let hits = 0;
  let posMass = 0;
  let negMass = 0;

  tokens.forEach((token, index) => {
    const side = pivot >= 0 ? (index > pivot ? 1.35 : index < pivot ? 0.75 : 1) : 1;
    if (NEGATORS.has(token)) {
      armed = 3;
      boost = 1;
      return;
    }
    if (token in BOOST) {
      boost = BOOST[token];
      return;
    }
    const lex = LEXICON[token];
    if (lex == null) {
      if (armed > 0) armed -= 1;
      boost = 1;
      return;
    }
    const signed = lex * (armed > 0 ? -1 : 1) * boost * side;
    armed = 0;
    boost = 1;
    hits += 1;
    if (signed > 0) posMass += signed;
    else negMass += -signed;
  });

  const total = posMass + negMass;
  const compound = total === 0 ? 0 : (posMass - negMass) / (total + 3);
  return { hits, posMass, negMass, compound };
}

function clip(text: string, max: number) {
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1).replace(/\s+\S*$/, "");
  return `${cut.length > 24 ? cut : text.slice(0, max - 1)}…`;
}

function sentencesOf(text: string) {
  return text
    .split(/(?<=[.!?।])\s+/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => {
      const letters = (sentence.match(/\p{L}/gu) ?? []).length;
      if (letters < 28) return false;
      if (letters / sentence.length < 0.55) return false;
      if (/^page\s+\d+/i.test(sentence)) return false;
      return true;
    });
}

function summarize(text: string, label: string) {
  const sentences = sentencesOf(text);
  if (sentences.length === 0) {
    const snippet = text.slice(0, 280).trim();
    if (snippet.length < 40) {
      return {
        headline: `${label} could not be read closely`,
        summary:
          "This PDF has too little selectable text to summarise the article. The original page is attached for reference.",
      };
    }
    return { headline: clip(snippet, 110), summary: text.length > snippet.length ? `${snippet}…` : snippet };
  }
  const headline = clip(sentences[0].replace(/[.!?।]+$/u, ""), 110);
  let summary = sentences.slice(0, 2).join(" ");
  if (summary.length > 520) summary = `${summary.slice(0, 500).replace(/\s+\S*$/, "")}…`;
  return { headline, summary };
}

function applyLanguage(brief: NewsBrief, forced?: Language): NewsBrief {
  if (!forced) return brief;
  return { ...brief, language: forced, nativeName: nativeNameFor(forced) };
}

function unreadable(label: string, sourceText: string): NewsBrief {
  const { headline, summary } = summarize(sourceText, label);
  return {
    headline,
    summary,
    sentiment: "neutral",
    confidence: 24,
    language: "English",
    nativeName: "English",
    reviewFlag: "Confidence stays low because the page text could not be read.",
    sourceText,
    keywords: [],
  };
}

/**
 * Read a page's text into a short summary, a sentiment, and a confidence that tracks the evidence.
 * `readQuality` is 0–1 from the extractor (text layer or OCR). Omitted means judge the text itself.
 */
export function briefFromText(
  raw: string,
  label: string,
  readQuality?: number,
  forced?: Language,
): NewsBrief {
  const sourceText = normalizePageText(raw).slice(0, 20000);
  const words = wordCount(sourceText);
  if (words < 8) return applyLanguage(unreadable(label, sourceText), forced);

  const extracted = qualityFromText(sourceText);
  const quality = readQuality == null ? extracted : clamp((readQuality + extracted) / 2, 0.15, 0.97);
  const { headline, summary } = summarize(sourceText, label);
  const detected = detectLanguage(sourceText);
  const language = forced ?? detected.language;
  const nativeName = forced ? nativeNameFor(forced) : detected.nativeName;
  const scored = scoreTokens(tokensOf(sourceText));
  const opposition = scored.posMass > 1.5 && scored.negMass > 1.5;
  const coverage = clamp(words / 160, 0, 1);
  const clarity = Math.abs(scored.compound);

  let sentiment: Sentiment = "neutral";
  if (scored.hits >= 2 && clarity >= 0.18) {
    sentiment = scored.compound > 0 ? "positive" : "negative";
  }

  let base: number;
  if (sentiment === "neutral") {
    const pull = scored.hits >= 2 ? clarity : clarity * 0.2;
    base = 76 + coverage * 14 - pull * 24 - (opposition ? 10 : 0);
  } else {
    base = 60 + clarity * 26 + Math.min(scored.hits, 8) * 2.1 + coverage * 8;
    if (opposition) base *= 0.7;
  }
  let confidence = Math.round(clamp(base * (0.66 + 0.3 * quality), 12, 93));

  let reviewFlag: string | undefined;
  if (quality < 0.55) {
    reviewFlag = "Only part of the page could be read, so this confidence stays lower.";
    confidence = Math.min(confidence, 58);
  }
  if (language !== "English") {
    if (scored.hits < 2) {
      sentiment = "neutral";
      confidence = Math.min(confidence, 46);
    } else {
      confidence = Math.min(confidence, 74);
    }
    reviewFlag = "Sentiment for this language uses a short word list, so the score stays conservative.";
  }

  const keywords = /payu/i.test(sourceText) ? ["PayU"] : [];
  return {
    headline,
    summary,
    sentiment,
    confidence,
    language,
    nativeName,
    reviewFlag,
    sourceText,
    keywords,
  };
}
