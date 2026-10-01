import uuid
from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict


class ParsedRow(BaseModel):
    row_number: int
    raw: dict[str, str]


class AnalyzeResponse(BaseModel):
    filename: str
    row_count: int
    columns: list[str]
    suggested_mapping: dict[str, str | None]
    rows: list[ParsedRow]


class ColumnMapping(BaseModel):
    transaction_date: str | None = None
    description: str | None = None
    amount: str | None = None
    type: str | None = None
    category: str | None = None
    payment_method: str | None = None


class ValidateRequest(BaseModel):
    rows: list[ParsedRow]
    mapping: ColumnMapping


class ValidatedRow(BaseModel):
    row_number: int
    status: str
    issues: list[str]
    transaction_date: date | None
    description: str
    amount: Decimal | None
    type: str
    payment_method: str
    category_id: str | None
    category_name: str | None
    suggested_category_id: str | None = None
    suggested_category_name: str | None = None
    suggested_category_confidence: float | None = None


class ValidateResponse(BaseModel):
    valid_count: int
    warning_count: int
    invalid_count: int
    rows: list[ValidatedRow]
    ai_categorization_available: bool


class ConfirmRow(BaseModel):
    transaction_date: date
    description: str
    amount: Decimal
    type: str
    payment_method: str
    category_id: uuid.UUID | None = None


class ConfirmRequest(BaseModel):
    filename: str
    rows: list[ConfirmRow]


class ConfirmResponse(BaseModel):
    imported_count: int


class UploadedFileRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    business_id: uuid.UUID
    filename: str
    row_count: int
    imported_count: int
    created_at: datetime
