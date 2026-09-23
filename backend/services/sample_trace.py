"""Sample Digital Twin text for an uploaded PDF.

The file is stored. OCR and translation are placeholders until a live read exists.
"""

import json
import re
import uuid

from models.tables import Mention

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


def sample_mention(file_name: str, uploaded_at: str, mention_id: str | None = None) -> Mention:
    label = label_from_file(file_name)
    mention_id = mention_id or new_id("upl")
    suffix = mention_id.removeprefix("upl-")
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
        language="English",
        native_name="English",
        sentiment="neutral",
        confidence=90,
        review_flag="Sample text for this demo. The PDF was not read; a live desk would replace this with the scan.",
        headline=f"{label} is ready to trace",
        native_headline=label,
        summary=(
            f"{file_name} was added from this browser. The alert, translation, and OCR steps "
            "use sample text so the chain can be opened now. The original PDF is attached to the page."
        ),
        translation=(
            f"{label} was added as a PDF. This English paragraph is sample translation, so the desk "
            "can walk alert, translation, OCR, and the original page before a live read is connected. "
            "Figures on the printed page are not claimed here. The brand keyword PayU is marked the "
            "way a real alert would mark it."
        ),
        ocr_text=(
            f"Sample OCR for {file_name}. The uploaded PDF is attached on the original-page step. "
            "A live desk would replace this paragraph with the text read from the scan."
        ),
        page_number=1,
        edition="Upload",
        column_name="Uploaded PDF",
        published_at=uploaded_at,
        detected_at=uploaded_at,
        latency_minutes=1,
        source_kind="epaper",
        channels_json=json.dumps(["email"]),
        keywords_json=json.dumps([BRAND]),
        file_name=file_name,
        sample_trace=True,
    )
