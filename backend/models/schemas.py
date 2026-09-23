from pydantic import BaseModel, ConfigDict, Field


def to_camel(name: str) -> str:
    head, *tail = name.split("_")
    return head + "".join(part.capitalize() for part in tail)


class APIModel(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)


class UploadOut(APIModel):
    id: str
    file_name: str
    size_bytes: int
    uploaded_at: str
    mention_id: str


class ChainOut(APIModel):
    page_id: str
    ocr_id: str
    translation_id: str
    alert_id: str


class AlertOut(APIModel):
    id: str
    headline: str
    summary: str
    sentiment: str
    confidence: int
    brand: str
    publication: str
    city: str
    language: str
    review_flag: str | None = None


class TextStageOut(APIModel):
    id: str
    language: str
    text: str


class PageOut(APIModel):
    id: str
    file_name: str
    file_url: str
    page_number: int
    edition: str
    column: str


class TwinOut(APIModel):
    id: str
    file_name: str
    sample_trace: bool
    chain: ChainOut
    alert: AlertOut
    translation: TextStageOut
    ocr: TextStageOut
    page: PageOut


class MentionOut(APIModel):
    id: str
    chain: ChainOut
    brand: str
    publication: str
    masthead: str
    city: str
    language: str
    native_name: str
    sentiment: str
    confidence: int
    review_flag: str | None = None
    headline: str
    native_headline: str
    summary: str
    translation: str
    ocr_text: str
    page_number: int
    edition: str
    column: str
    published_at: str
    detected_at: str
    latency_minutes: int
    source_kind: str
    channels: list[str]
    keywords: list[str]
    file_name: str | None = None
    sample_trace: bool


class SourceOut(APIModel):
    id: str
    publication: str
    language: str
    city: str
    kind: str
    url: str
    schedule: str
    status: str
    last_fetch: str
    pages_today: int
    enabled: bool


class SourceCreate(APIModel):
    publication: str = Field(min_length=2, max_length=120)
    language: str
    city: str = Field(min_length=2, max_length=80)
    kind: str = "epaper"
    url: str = Field(min_length=3, max_length=255)
    schedule: str = "Daily · 5:45 AM"


class SourceUpdate(APIModel):
    enabled: bool | None = None
