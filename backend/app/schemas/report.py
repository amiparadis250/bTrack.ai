import uuid
from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, field_validator

from app.models.report import REPORT_FORMATS, REPORT_TYPES


class ReportCreateRequest(BaseModel):
    report_type: str
    format: str
    period_start: date
    period_end: date

    @field_validator("report_type")
    @classmethod
    def validate_report_type(cls, value: str) -> str:
        if value not in REPORT_TYPES:
            raise ValueError(f"report_type must be one of {REPORT_TYPES}")
        return value

    @field_validator("format")
    @classmethod
    def validate_format(cls, value: str) -> str:
        if value not in REPORT_FORMATS:
            raise ValueError(f"format must be one of {REPORT_FORMATS}")
        return value


class ReportRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    business_id: uuid.UUID
    report_type: str
    format: str
    period_start: date
    period_end: date
    created_at: datetime
