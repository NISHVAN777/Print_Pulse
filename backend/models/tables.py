from sqlalchemy import Boolean, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from models.base import Base


class Upload(Base):
    __tablename__ = "uploads"

    id: Mapped[str] = mapped_column(String(32), primary_key=True)
    file_name: Mapped[str] = mapped_column(String(255))
    stored_name: Mapped[str] = mapped_column(String(64))
    size_bytes: Mapped[int] = mapped_column(Integer)
    uploaded_at: Mapped[str] = mapped_column(String(32))
    mention_id: Mapped[str] = mapped_column(String(32), ForeignKey("mentions.id"), unique=True)


class Mention(Base):
    __tablename__ = "mentions"

    id: Mapped[str] = mapped_column(String(32), primary_key=True)
    page_id: Mapped[str] = mapped_column(String(64))
    ocr_id: Mapped[str] = mapped_column(String(64))
    translation_id: Mapped[str] = mapped_column(String(64))
    alert_id: Mapped[str] = mapped_column(String(64))
    brand: Mapped[str] = mapped_column(String(64))
    publication: Mapped[str] = mapped_column(String(120))
    masthead: Mapped[str] = mapped_column(String(120))
    city: Mapped[str] = mapped_column(String(80))
    language: Mapped[str] = mapped_column(String(32))
    native_name: Mapped[str] = mapped_column(String(64))
    sentiment: Mapped[str] = mapped_column(String(16))
    confidence: Mapped[int] = mapped_column(Integer)
    review_flag: Mapped[str | None] = mapped_column(Text, nullable=True)
    headline: Mapped[str] = mapped_column(Text)
    native_headline: Mapped[str] = mapped_column(Text)
    summary: Mapped[str] = mapped_column(Text)
    translation: Mapped[str] = mapped_column(Text)
    ocr_text: Mapped[str] = mapped_column(Text)
    page_number: Mapped[int] = mapped_column(Integer)
    edition: Mapped[str] = mapped_column(String(64))
    column_name: Mapped[str] = mapped_column(String(80))
    published_at: Mapped[str] = mapped_column(String(32))
    detected_at: Mapped[str] = mapped_column(String(32))
    latency_minutes: Mapped[int] = mapped_column(Integer)
    source_kind: Mapped[str] = mapped_column(String(32))
    channels_json: Mapped[str] = mapped_column(Text)
    keywords_json: Mapped[str] = mapped_column(Text)
    file_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    sample_trace: Mapped[bool] = mapped_column(Boolean, default=False)


class Source(Base):
    __tablename__ = "sources"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    publication: Mapped[str] = mapped_column(String(120))
    language: Mapped[str] = mapped_column(String(32))
    city: Mapped[str] = mapped_column(String(80))
    kind: Mapped[str] = mapped_column(String(32))
    url: Mapped[str] = mapped_column(String(255))
    schedule: Mapped[str] = mapped_column(String(80))
    status: Mapped[str] = mapped_column(String(32))
    last_fetch: Mapped[str] = mapped_column(String(32))
    pages_today: Mapped[int] = mapped_column(Integer, default=0)
    enabled: Mapped[bool] = mapped_column(Boolean, default=True)
