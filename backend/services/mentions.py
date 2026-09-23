import json

from sqlalchemy import select
from sqlalchemy.orm import Session

from models.schemas import ChainOut, MentionOut
from models.tables import Mention
from services.errors import ApiError

SENTIMENTS = {"positive", "neutral", "negative"}


def list_mentions(
    db: Session,
    *,
    language: str | None = None,
    sentiment: str | None = None,
    q: str | None = None,
) -> list[MentionOut]:
    if sentiment and sentiment not in SENTIMENTS:
        raise ApiError(400, "Sentiment must be positive, neutral, or negative.")
    rows = db.scalars(select(Mention).order_by(Mention.detected_at.desc(), Mention.id.desc())).all()
    query = (q or "").strip().lower()
    matched = []
    for row in rows:
        if language and row.language.lower() != language.lower():
            continue
        if sentiment and row.sentiment != sentiment:
            continue
        if query and query not in _haystack(row):
            continue
        matched.append(_mention_out(row))
    return matched


def get_mention(db: Session, mention_id: str) -> MentionOut:
    row = db.get(Mention, mention_id)
    if row is None:
        raise ApiError(404, "Mention not found.")
    return _mention_out(row)


def _haystack(row: Mention) -> str:
    return " ".join(
        [
            row.headline,
            row.publication,
            row.city,
            row.summary,
            row.language,
            row.translation,
            row.file_name or "",
        ]
    ).lower()


def _mention_out(row: Mention) -> MentionOut:
    return MentionOut(
        id=row.id,
        chain=ChainOut(
            page_id=row.page_id,
            ocr_id=row.ocr_id,
            translation_id=row.translation_id,
            alert_id=row.alert_id,
        ),
        brand=row.brand,
        publication=row.publication,
        masthead=row.masthead,
        city=row.city,
        language=row.language,
        native_name=row.native_name,
        sentiment=row.sentiment,
        confidence=row.confidence,
        review_flag=row.review_flag,
        headline=row.headline,
        native_headline=row.native_headline,
        summary=row.summary,
        translation=row.translation,
        ocr_text=row.ocr_text,
        page_number=row.page_number,
        edition=row.edition,
        column=row.column_name,
        published_at=row.published_at,
        detected_at=row.detected_at,
        latency_minutes=row.latency_minutes,
        source_kind=row.source_kind,
        channels=json.loads(row.channels_json),
        keywords=json.loads(row.keywords_json),
        file_name=row.file_name,
        sample_trace=row.sample_trace,
    )
