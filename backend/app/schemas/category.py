import uuid

from pydantic import BaseModel, ConfigDict, Field

from app.models.category import CATEGORY_TYPES


class CategoryCreateRequest(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    type: str

    def validated_type(self) -> str:
        if self.type not in CATEGORY_TYPES:
            raise ValueError(f"type must be one of {CATEGORY_TYPES}")
        return self.type


class CategoryRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    business_id: uuid.UUID
    name: str
    type: str
    is_default: bool
