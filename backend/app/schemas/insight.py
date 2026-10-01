import uuid
from datetime import date, datetime
from decimal import Decimal
from typing import Any

from pydantic import BaseModel, ConfigDict


class InsightRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    business_id: uuid.UUID
    type: str
    title: str
    description: str
    period_start: date
    period_end: date
    supporting_data: dict[str, Any]
    created_at: datetime


class ProjectionPoint(BaseModel):
    period: str
    revenue: Decimal
    expenses: Decimal


class ProjectionRead(BaseModel):
    has_enough_data: bool
    based_on_months: int
    history: list[ProjectionPoint]
    projected_revenue: Decimal | None
    projected_expenses: Decimal | None
    projected_profit: Decimal | None
