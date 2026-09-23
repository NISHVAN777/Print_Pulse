from pathlib import Path

from fastapi import UploadFile
from sqlalchemy import select
from sqlalchemy.orm import Session

from database import MAX_PDF_BYTES, UPLOAD_DIR
from models.schemas import AlertOut, ChainOut, PageOut, TextStageOut, TwinOut, UploadOut
from models.tables import Mention, Upload
from services.clock import stamp
from services.errors import ApiError
from services.sample_trace import display_name, new_id, sample_mention

PDF_TYPES = {"application/pdf", "application/x-pdf", ""}


def list_uploads(db: Session) -> list[UploadOut]:
    rows = db.scalars(select(Upload).order_by(Upload.uploaded_at.desc(), Upload.id.desc())).all()
    return [_upload_out(row) for row in rows]


def get_upload(db: Session, upload_id: str) -> Upload:
    row = db.get(Upload, upload_id)
    if row is None:
        raise ApiError(404, "Upload not found.")
    return row


def stored_path(upload: Upload) -> Path:
    return UPLOAD_DIR / upload.stored_name


async def save_upload(db: Session, file: UploadFile) -> UploadOut:
    file_name = display_name(file.filename)
    content_type = (file.content_type or "").split(";")[0].strip().lower()
    if content_type not in PDF_TYPES and not file_name.lower().endswith(".pdf"):
        raise ApiError(400, "Only PDF files can be uploaded.")
    if content_type.startswith(("image/", "video/", "audio/", "text/")):
        raise ApiError(400, "Only PDF files can be uploaded.")

    upload_id = new_id("upl")
    stored_name = f"{upload_id}.pdf"
    destination = UPLOAD_DIR / stored_name
    size = 0
    try:
        size = await _write_pdf(file, destination)
    except ApiError:
        destination.unlink(missing_ok=True)
        raise
    except Exception:
        destination.unlink(missing_ok=True)
        raise

    uploaded_at = stamp()
    mention = sample_mention(file_name, uploaded_at, upload_id)
    upload = Upload(
        id=upload_id,
        file_name=file_name,
        stored_name=stored_name,
        size_bytes=size,
        uploaded_at=uploaded_at,
        mention_id=mention.id,
    )
    db.add(mention)
    db.flush()
    db.add(upload)
    try:
        db.commit()
    except Exception:
        db.rollback()
        destination.unlink(missing_ok=True)
        raise
    db.refresh(upload)
    return _upload_out(upload)


def twin_for(db: Session, upload_id: str, file_url: str) -> TwinOut:
    upload = get_upload(db, upload_id)
    mention = db.get(Mention, upload.mention_id)
    if mention is None:
        raise ApiError(404, "Digital Twin for this upload was not found.")
    return TwinOut(
        id=upload.id,
        file_name=upload.file_name,
        sample_trace=mention.sample_trace,
        chain=ChainOut(
            page_id=mention.page_id,
            ocr_id=mention.ocr_id,
            translation_id=mention.translation_id,
            alert_id=mention.alert_id,
        ),
        alert=AlertOut(
            id=mention.alert_id,
            headline=mention.headline,
            summary=mention.summary,
            sentiment=mention.sentiment,
            confidence=mention.confidence,
            brand=mention.brand,
            publication=mention.publication,
            city=mention.city,
            language=mention.language,
            review_flag=mention.review_flag,
        ),
        translation=TextStageOut(id=mention.translation_id, language="English", text=mention.translation),
        ocr=TextStageOut(id=mention.ocr_id, language=mention.language, text=mention.ocr_text),
        page=PageOut(
            id=mention.page_id,
            file_name=upload.file_name,
            file_url=file_url,
            page_number=mention.page_number,
            edition=mention.edition,
            column=mention.column_name,
        ),
    )


async def _write_pdf(file: UploadFile, destination: Path) -> int:
    head = await file.read(1024)
    if b"%PDF-" not in head:
        raise ApiError(400, "That file is not a PDF. Choose an ePaper export.")
    size = len(head)
    if size > MAX_PDF_BYTES:
        raise ApiError(413, "Choose a PDF under 32 MB.")
    with destination.open("wb") as handle:
        handle.write(head)
        while True:
            chunk = await file.read(1024 * 1024)
            if not chunk:
                break
            size += len(chunk)
            if size > MAX_PDF_BYTES:
                raise ApiError(413, "Choose a PDF under 32 MB.")
            handle.write(chunk)
    if size < 5:
        raise ApiError(400, "That PDF is empty.")
    return size


def _upload_out(row: Upload) -> UploadOut:
    return UploadOut(
        id=row.id,
        file_name=row.file_name,
        size_bytes=row.size_bytes,
        uploaded_at=row.uploaded_at,
        mention_id=row.mention_id,
    )
