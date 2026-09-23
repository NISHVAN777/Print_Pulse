"""Digital Twin fields for an uploaded PDF, scored from the text in the file."""

import json
import re
import uuid

from models.tables import Mention
from services.news_brief import brief_from_text

BRAND = "PayU"


def new_id(prefix: str) -> str:
    return f"{prefix}-{uuid.uuid4().hex[:8]}"


def label_from_file(name: str) -> str:
    stem = re.sub(r"\.pdf$", "", name, flags=re.IGNORECASE)
    stem = re.sub(r"[_\-.]+", " ", stem)
    stem = re.sub(r"\s+", " ", stem).strip()
    if len(stem) < 2:
        return "Uploaded ePaper"
    return re.sub(r"\b([a-z])", lambda match: match.group(1).upper(), stem)


def display_name(raw_name: str | None) -> str:
    name = (raw_name or "upload.pdf").replace("\\", "/").split("/")[-1].strip()
    if not name:
        name = "upload.pdf"
    if not name.lower().endswith(".pdf"):
        name = f"{name}.pdf"
    return name[:180]


def sample_mention(
    file_name: str,
    uploaded_at: str,
    mention_id: str | None = None,
    text: str = "",
) -> Mention:
    label = label_from_file(file_name)
    mention_id = mention_id or new_id("upl")
    suffix = mention_id.removeprefix("upl-")
    brief = brief_from_text(text, label)
    source = str(brief["source_text"]) or f"No selectable text was found in {file_name}."
    keywords = brief["keywords"] if isinstance(brief["keywords"], list) else []
    raw_confidence = brief["confidence"]
    confidence = raw_confidence if isinstance(raw_confidence, int) else 24
    return Mention(
        id=mention_id,
        page_id=f"page_upload_{suffix}",
        ocr_id=f"ocr_upload_{suffix}",
        translation_id=f"tr_upload_{suffix}",
        alert_id=f"alert_upload_{suffix}",
        brand=BRAND,
        publication=label,
        masthead=label,
        city="Desk upload",
        language=str(brief["language"]),
        native_name=str(brief["native_name"]),
        sentiment=str(brief["sentiment"]),
        confidence=confidence,
        review_flag=brief["review_flag"] if isinstance(brief["review_flag"], str) else None,
        headline=str(brief["headline"]),
        native_headline=str(brief["headline"]),
        summary=str(brief["summary"]),
        translation=str(brief["summary"]),
        ocr_text=source,
        page_number=1,
        edition="Upload",
        column_name="Uploaded PDF",
        published_at=uploaded_at,
        detected_at=uploaded_at,
        latency_minutes=1,
        source_kind="epaper",
        channels_json=json.dumps(["email"]),
        keywords_json=json.dumps(keywords),
        file_name=file_name,
        sample_trace=True,
    )
