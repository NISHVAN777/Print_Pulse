import type { Language } from "@/types";

/** Desk languages, the name printed on the page, and the OCR model for that script. */
export const PAGE_LANGUAGES: { id: Language; nativeName: string; ocr: string }[] = [
  { id: "Hindi", nativeName: "हिन्दी", ocr: "hin+eng" },
  { id: "Tamil", nativeName: "தமிழ்", ocr: "tam+eng" },
  { id: "Telugu", nativeName: "తెలుగు", ocr: "tel+eng" },
  { id: "Marathi", nativeName: "मराठी", ocr: "mar+eng" },
  { id: "Bengali", nativeName: "বাংলা", ocr: "ben+eng" },
  { id: "Gujarati", nativeName: "ગુજરાતી", ocr: "guj+eng" },
  { id: "Malayalam", nativeName: "മലയാളം", ocr: "mal+eng" },
  { id: "English", nativeName: "English", ocr: "eng" },
];

export function nativeNameFor(language: Language) {
  return PAGE_LANGUAGES.find((item) => item.id === language)?.nativeName ?? language;
}

export function ocrCodeFor(language: Language) {
  return PAGE_LANGUAGES.find((item) => item.id === language)?.ocr ?? "eng";
}
