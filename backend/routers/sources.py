from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from models.schemas import SourceCreate, SourceOut, SourceUpdate
from services.sources import create_source, get_source, list_sources, update_source

router = APIRouter(prefix="/sources", tags=["sources"])
Db = Annotated[Session, Depends(get_db)]


@router.get("", response_model=list[SourceOut])
def read_sources(db: Db) -> list[SourceOut]:
    return list_sources(db)


@router.post("", response_model=SourceOut, status_code=201)
def add_source(payload: SourceCreate, db: Db) -> SourceOut:
    return create_source(db, payload)


@router.get("/{source_id}", response_model=SourceOut)
def read_source(source_id: str, db: Db) -> SourceOut:
    return get_source(db, source_id)


@router.patch("/{source_id}", response_model=SourceOut)
def patch_source(source_id: str, payload: SourceUpdate, db: Db) -> SourceOut:
    return update_source(db, source_id, payload)
