import re

from sqlalchemy import select
from sqlalchemy.orm import Session

from models.schemas import SourceCreate, SourceOut, SourceUpdate
from models.tables import Source
from services.clock import stamp
from services.errors import ApiError
from services.sample_trace import new_id

LANGUAGES = {"Hindi", "Tamil", "Telugu", "Marathi", "Bengali", "Gujarati", "Malayalam", "English"}
KINDS = {"epaper", "email-clipping"}


def list_sources(db: Session) -> list[SourceOut]:
    rows = db.scalars(select(Source).order_by(Source.publication)).all()
    return [_source_out(row) for row in rows]


def get_source(db: Session, source_id: str) -> SourceOut:
    row = db.get(Source, source_id)
    if row is None:
        raise ApiError(404, "Source not found.")
    return _source_out(row)


def create_source(db: Session, payload: SourceCreate) -> SourceOut:
    language = _language(payload.language)
    kind = payload.kind.strip()
    if kind not in KINDS:
        raise ApiError(400, "Kind must be epaper or email-clipping.")
    source_id = _source_id(db, payload.publication)
    row = Source(
        id=source_id,
        publication=payload.publication.strip(),
        language=language,
        city=payload.city.strip(),
        kind=kind,
        url=payload.url.strip(),
        schedule=payload.schedule.strip() or ("Daily · 5:45 AM" if kind == "epaper" else "On arrival"),
        status="connected",
        last_fetch=stamp(),
        pages_today=0,
        enabled=True,
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return _source_out(row)


def update_source(db: Session, source_id: str, payload: SourceUpdate) -> SourceOut:
    row = db.get(Source, source_id)
    if row is None:
        raise ApiError(404, "Source not found.")
    if payload.enabled is not None:
        row.enabled = payload.enabled
        row.status = "connected" if payload.enabled else "paused"
    db.commit()
    db.refresh(row)
    return _source_out(row)


def _language(value: str) -> str:
    match = next((language for language in LANGUAGES if language.lower() == value.strip().lower()), None)
    if match is None:
        raise ApiError(400, "Language is not one of the desk languages.")
    return match


def _source_id(db: Session, publication: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", publication.lower()).strip("-") or "source"
    candidate = f"src-{slug}"[:60]
    if db.get(Source, candidate) is None:
        return candidate
    return f"{candidate[:48]}-{new_id('src').split('-', 1)[1]}"


def _source_out(row: Source) -> SourceOut:
    return SourceOut(
        id=row.id,
        publication=row.publication,
        language=row.language,
        city=row.city,
        kind=row.kind,
        url=row.url,
        schedule=row.schedule,
        status=row.status,
        last_fetch=row.last_fetch,
        pages_today=row.pages_today,
        enabled=row.enabled,
    )
