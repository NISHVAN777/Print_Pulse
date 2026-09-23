from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from database import get_db
from models.schemas import MentionOut
from services.mentions import get_mention, list_mentions

router = APIRouter(prefix="/mentions", tags=["mentions"])
Db = Annotated[Session, Depends(get_db)]


@router.get("", response_model=list[MentionOut])
def read_mentions(
    db: Db,
    language: Annotated[str | None, Query()] = None,
    sentiment: Annotated[str | None, Query()] = None,
    q: Annotated[str | None, Query()] = None,
) -> list[MentionOut]:
    return list_mentions(db, language=language, sentiment=sentiment, q=q)


@router.get("/{mention_id}", response_model=MentionOut)
def read_mention(mention_id: str, db: Db) -> MentionOut:
    return get_mention(db, mention_id)
