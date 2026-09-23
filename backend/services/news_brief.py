"""Summary, sentiment, and confidence from text read out of an uploaded PDF."""

from __future__ import annotations

import re
from pathlib import Path

POSITIVE = {
    "growth": 2, "profit": 2, "profits": 2, "profitable": 2, "surge": 2, "surged": 2,
    "success": 2, "successful": 2, "praise": 2, "praised": 2, "partnership": 2,
    "partnerships": 2, "boost": 2, "boosted": 2, "gain": 2, "gains": 2, "win": 2,
    "wins": 2, "award": 2, "innovation": 2, "expand": 2, "expansion": 2, "improved": 2,
    "improvement": 2, "stronger": 2, "optimistic": 2, "recovery": 2, "recovered": 2,
    "milestone": 2, "beneficial": 2, "reliable": 2, "celebrate": 2, "celebrated": 2,
    "outperform": 2, "outpaced": 2, "welcomed": 2, "welcome": 2, "opportunity": 2,
    "opportunities": 2, "soar": 2, "soared": 2, "rally": 2, "rallied": 2, "cleared": 2,
    "record": 1, "higher": 1, "better": 1, "best": 1, "helped": 1, "help": 1,
    "increase": 1, "increased": 1, "positive": 1, "stable": 1, "stability": 1,
    "agreed": 1, "approved": 1, "approval": 1, "improve": 1, "rising": 1, "rose": 1,
    "rise": 1, "वृद्धि": 2, "लाभ": 2, "सफलता": 2, "साझेदारी": 2, "सुधार": 2,
    "बढ़त": 2, "मजबूत": 2, "सम्मान": 2, "बढ़ोतरी": 2, "வளர்ச்சி": 2, "லாபம்": 2, "வெற்றி": 2,
}
NEGATIVE = {
    "fraud": 2, "scam": 2, "lawsuit": 2, "sued": 2, "fined": 2, "penalty": 2,
    "penalties": 2, "outage": 2, "failure": 2, "failed": 2, "complaint": 2,
    "complaints": 2, "probe": 2, "banned": 2, "ban": 2, "breach": 2, "hacked": 2,
    "hack": 2, "losses": 2, "loss": 2, "decline": 2, "declined": 2, "crash": 2,
    "crashed": 2, "crisis": 2, "scandal": 2, "allegation": 2, "allegations": 2,
    "alleged": 2, "defaulted": 2, "bankrupt": 2, "bankruptcy": 2, "layoff": 2,
    "layoffs": 2, "protest": 2, "protests": 2, "criticism": 2, "criticised": 2,
    "criticized": 2, "illegal": 2, "dispute": 2, "disputed": 2, "unpaid": 2,
    "suspended": 2, "suspension": 2, "investigation": 2, "investigated": 2,
    "cheat": 2, "cheated": 2, "misleading": 2, "unsafe": 2, "embezzlement": 2,
    "embezzled": 2, "guilty": 2, "conviction": 2, "convicted": 2, "downgrade": 2,
    "downgraded": 2, "weaker": 1, "concern": 1, "concerns": 1, "problem": 1,
    "problems": 1, "slower": 1, "missed": 1, "poor": 1, "worse": 1, "worst": 1,
    "halted": 1, "halt": 1, "paused": 1, "closure": 1, "worried": 1, "worry": 1,
    "fear": 1, "fears": 1, "delay": 1, "delayed": 1, "delays": 1, "glitch": 1,
    "glitches": 1, "warning": 1, "warned": 1, "slump": 1, "slumped": 1, "fall": 1,
    "fell": 1, "drop": 1, "dropped": 1, "lower": 1, "घोटाला": 2, "नुकसान": 2,
    "गिरावट": 2, "शिकायत": 2, "जुर्माना": 2, "प्रतिबंध": 2, "जांच": 2, "संकट": 2,
    "धोखा": 2, "विवाद": 2, "देरी": 2, "गिरफ्तारी": 2, "மோசடி": 2, "இழப்பு": 2,
    "புகார்": 2, "தடை": 2,
}
LEXICON = {**{word: weight for word, weight in POSITIVE.items()}, **{word: -weight for word, weight in NEGATIVE.items()}}
NEGATORS = {
    "not", "no", "never", "neither", "nor", "without", "hardly", "barely", "isn't",
    "wasn't", "aren't", "weren't", "don't", "doesn't", "didn't", "won't", "can't",
    "cannot", "nobody", "none",
}
BOOST = {
    "very": 1.4, "extremely": 1.7, "highly": 1.4, "sharply": 1.6, "significantly": 1.5,
    "strongly": 1.4, "heavily": 1.5, "slightly": 0.6, "somewhat": 0.7, "partly": 0.7,
}
SCRIPTS = (
    ("Hindi", "हिन्दी", r"\u0900-\u097F"),
    ("Tamil", "தமிழ்", r"\u0B80-\u0BFF"),
    ("Telugu", "తెలుగు", r"\u0C00-\u0C7F"),
    ("Bengali", "বাংলা", r"\u0980-\u09FF"),
    ("Gujarati", "ગુજરાતી", r"\u0A80-\u0AFF"),
    ("Malayalam", "മലയാളം", r"\u0D00-\u0D7F"),
)


def _clamp(value: float, low: float, high: float) -> float:
    return max(low, min(high, value))


def normalize_page_text(raw: str) -> str:
    text = raw.replace("\u00ad", "")
    text = re.sub(r"(\w)-\n\s*(?=\w)", r"\1", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


_TOKEN = re.compile(
    r"[0-9A-Za-z\u00C0-\u024F\u0900-\u097F\u0980-\u09FF\u0A80-\u0AFF\u0B80-\u0BFF\u0C00-\u0C7F\u0D00-\u0D7F']+"
)


def _tokens(text: str) -> list[str]:
    lowered = text.lower().replace("’", "'").replace("‘", "'")
    return _TOKEN.findall(lowered)


def _word_count(text: str) -> int:
    return sum(1 for token in _tokens(text) if len(token) > 1)


def _quality(text: str) -> float:
    words = _word_count(text)
    letters = len(re.findall(r"[^\W\d_]", text, flags=re.UNICODE))
    ratio = letters / max(len(text), 1)
    if words < 8 or ratio < 0.35:
        return 0.22
    if words < 20:
        return 0.66
    if words < 40 or ratio < 0.5:
        return 0.78
    if ratio < 0.62:
        return 0.84
    return 0.93


def detect_language(text: str) -> tuple[str, str]:
    latin = len(re.findall(r"[A-Za-z]", text))
    best = ("English", "English", latin)
    for language, native, block in SCRIPTS:
        count = len(re.findall(f"[{block}]", text))
        if count > best[2]:
            best = (language, native, count)
    if best[0] == "Hindi":
        marathi = len(re.findall(r"(?:^|\s)(?:आहे|आणि|मध्ये|साठी)(?=\s|$)", text))
        hindi = len(re.findall(r"(?:^|\s)(?:है|और|नहीं)(?=\s|$)", text))
        if marathi > hindi:
            return "Marathi", "मराठी"
    return best[0], best[1]


def _score(tokens: list[str]) -> dict[str, float]:
    pivot = next((index for index, token in enumerate(tokens) if token in {"but", "however"}), -1)
    armed = 0
    boost = 1.0
    hits = 0
    pos_mass = 0.0
    neg_mass = 0.0
    for index, token in enumerate(tokens):
        side = 1.35 if pivot >= 0 and index > pivot else 0.75 if pivot >= 0 and index < pivot else 1
        if token in NEGATORS:
            armed = 3
            boost = 1
            continue
        if token in BOOST:
            boost = BOOST[token]
            continue
        lex = LEXICON.get(token)
        if lex is None:
            if armed > 0:
                armed -= 1
            boost = 1
            continue
        signed = lex * (-1 if armed > 0 else 1) * boost * side
        armed = 0
        boost = 1
        hits += 1
        if signed > 0:
            pos_mass += signed
        else:
            neg_mass += -signed
    total = pos_mass + neg_mass
    compound = 0 if total == 0 else (pos_mass - neg_mass) / (total + 3)
    return {"hits": hits, "pos": pos_mass, "neg": neg_mass, "compound": compound}


def _clip(text: str, limit: int) -> str:
    if len(text) <= limit:
        return text
    cut = re.sub(r"\s+\S*$", "", text[: limit - 1])
    base = cut if len(cut) > 24 else text[: limit - 1]
    return f"{base}…"


def _summarize(text: str, label: str) -> tuple[str, str]:
    sentences = []
    for sentence in re.split(r"(?<=[.!?।])\s+", text):
        sentence = sentence.strip()
        letters = len(re.findall(r"[^\W\d_]", sentence, flags=re.UNICODE))
        if letters < 28 or (letters / max(len(sentence), 1)) < 0.55:
            continue
        if re.match(r"^page\s+\d+", sentence, flags=re.IGNORECASE):
            continue
        sentences.append(sentence)
    if not sentences:
        snippet = text[:280].strip()
        if len(snippet) < 40:
            return (
                f"{label} could not be read closely",
                "This PDF has too little selectable text to summarise the article. The original page is attached for reference.",
            )
        summary = f"{snippet}…" if len(text) > len(snippet) else snippet
        return _clip(snippet, 110), summary
    headline = _clip(re.sub(r"[.!?।]+$", "", sentences[0]), 110)
    summary = " ".join(sentences[:2])
    if len(summary) > 520:
        summary = re.sub(r"\s+\S*$", "", summary[:500]) + "…"
    return headline, summary


def brief_from_text(raw: str, label: str, read_quality: float | None = None) -> dict[str, object]:
    source = normalize_page_text(raw)[:20000]
    words = _word_count(source)
    headline, summary = _summarize(source, label)
    if words < 8:
        return {
            "headline": headline,
            "summary": summary,
            "sentiment": "neutral",
            "confidence": 24,
            "language": "English",
            "native_name": "English",
            "review_flag": "Confidence stays low because the page text could not be read.",
            "source_text": source,
            "keywords": [],
        }

    extracted = _quality(source)
    quality = extracted if read_quality is None else _clamp((read_quality + extracted) / 2, 0.15, 0.97)
    language, native = detect_language(source)
    scored = _score(_tokens(source))
    opposition = scored["pos"] > 1.5 and scored["neg"] > 1.5
    coverage = _clamp(words / 160, 0, 1)
    clarity = abs(scored["compound"])
    sentiment = "neutral"
    if scored["hits"] >= 2 and clarity >= 0.18:
        sentiment = "positive" if scored["compound"] > 0 else "negative"

    if sentiment == "neutral":
        pull = clarity if scored["hits"] >= 2 else clarity * 0.2
        base = 76 + coverage * 14 - pull * 24 - (10 if opposition else 0)
    else:
        base = 60 + clarity * 26 + min(scored["hits"], 8) * 2.1 + coverage * 8
        if opposition:
            base *= 0.7
    confidence = int(round(_clamp(base * (0.66 + 0.3 * quality), 12, 93)))
    review = None
    if quality < 0.55:
        review = "Only part of the page could be read, so this confidence stays lower."
        confidence = min(confidence, 58)
    if language != "English":
        if scored["hits"] < 2:
            sentiment = "neutral"
            confidence = min(confidence, 46)
        else:
            confidence = min(confidence, 74)
        review = "Sentiment for this language uses a short word list, so the score stays conservative."

    keywords = ["PayU"] if re.search(r"payu", source, flags=re.IGNORECASE) else []
    return {
        "headline": headline,
        "summary": summary,
        "sentiment": sentiment,
        "confidence": confidence,
        "language": language,
        "native_name": native,
        "review_flag": review,
        "source_text": source,
        "keywords": keywords,
    }


def extract_pdf_text(path: Path) -> str:
    from pypdf import PdfReader

    reader = PdfReader(str(path))
    if reader.is_encrypted:
        return ""
    chunks: list[str] = []
    total = 0
    for page in reader.pages[:8]:
        try:
            piece = page.extract_text() or ""
        except Exception:
            piece = ""
        chunks.append(piece)
        total += len(piece)
        if total >= 20000:
            break
    return "\n".join(chunks)[:20000]
