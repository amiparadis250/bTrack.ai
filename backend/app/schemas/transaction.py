import uuid
from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.models.transaction import PAYMENT_METHODS, TRANSACTION_TYPES


class TransactionCreateRequest(BaseModel):
    type: str
    amount: Decimal = Field(gt=0)
    description: str = Field(min_length=1, max_length=500)
    category_id: uuid.UUID | None = None
    transaction_date: date
    payment_method: str
    reference: str | None = Field(default=None, max_length=255)
    notes: str | None = None

    @field_validator("type")
    @classmethod
    def validate_type(cls, value: str) -> str:
        if value not in TRANSACTION_TYPES:
            raise ValueError(f"type must be one of {TRANSACTION_TYPES}")
        return value

    @field_validator("payment_method")
    @classmethod
    def validate_payment_method(cls, value: str) -> str:
        if value not in PAYMENT_METHODS:
            raise ValueError(f"payment_method must be one of {PAYMENT_METHODS}")
        return value


class TransactionUpdateRequest(BaseModel):
    type: str | None = None
    amount: Decimal | None = Field(default=None, gt=0)
    description: str | None = Field(default=None, min_length=1, max_length=500)
    category_id: uuid.UUID | None = None
    transaction_date: date | None = None
    payment_method: str | None = None
    reference: str | None = None
    notes: str | None = None


class TransactionRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    business_id: uuid.UUID
    category_id: uuid.UUID | None
    type: str
    amount: Decimal
    description: str
    transaction_date: date
    payment_method: str
    reference: str | None
    source: str
    notes: str | None
    created_at: datetime
    updated_at: datetime
