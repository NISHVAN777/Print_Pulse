from typing import Annotated

from fastapi import APIRouter, Depends, Request, UploadFile
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from database import get_db
from models.schemas import TwinOut, UploadOut
from services.errors import ApiError
from services.uploads import get_upload, list_uploads, save_upload, stored_path, twin_for

router = APIRouter(prefix="/uploads", tags=["uploads"])
Db = Annotated[Session, Depends(get_db)]


@router.get("", response_model=list[UploadOut])
def read_uploads(db: Db) -> list[UploadOut]:
    return list_uploads(db)


@router.post("", response_model=UploadOut, status_code=201)
async def create_upload(file: UploadFile, db: Db) -> UploadOut:
    return await save_upload(db, file)


@router.get("/{upload_id}/twin", response_model=TwinOut)
def read_twin(upload_id: str, request: Request, db: Db) -> TwinOut:
    file_url = str(request.url_for("download_upload", upload_id=upload_id))
    return twin_for(db, upload_id, file_url)


@router.get("/{upload_id}/file")
def download_upload(upload_id: str, db: Db) -> FileResponse:
    upload = get_upload(db, upload_id)
    path = stored_path(upload)
    if not path.is_file():
        raise ApiError(404, "The PDF is no longer on disk.")
    return FileResponse(path, media_type="application/pdf", filename=upload.file_name, content_disposition_type="inline")
