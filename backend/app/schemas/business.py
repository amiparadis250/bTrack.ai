import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models.business import BUSINESS_TYPES


class BusinessCreateRequest(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    business_type: str = Field(default="other")
    phone: str | None = None
    email: str | None = None
    location: str | None = None
    currency: str = Field(default="RWF", max_length=10)
    description: str | None = None

    def validate_type(self) -> str:
        return self.business_type if self.business_type in BUSINESS_TYPES else "other"


class BusinessUpdateRequest(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    business_type: str | None = None
    phone: str | None = None
    email: str | None = None
    location: str | None = None
    currency: str | None = Field(default=None, max_length=10)
    description: str | None = None


class BusinessRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    owner_id: uuid.UUID
    name: str
    business_type: str
    phone: str | None
    email: str | None
    location: str | None
    currency: str
    description: str | None
    created_at: datetime
