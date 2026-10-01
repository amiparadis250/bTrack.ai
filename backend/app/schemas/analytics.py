from datetime import date
from decimal import Decimal

from pydantic import BaseModel


class AnalyticsOverview(BaseModel):
    period_start: date
    period_end: date
    revenue: Decimal
    expenses: Decimal
    profit: Decimal
    profit_margin: float | None
    cash_inflow: Decimal
    cash_outflow: Decimal
    net_cash_flow: Decimal
    transaction_count: int


class TrendPoint(BaseModel):
    period: str
    revenue: Decimal
    expenses: Decimal


class CategoryBreakdownItem(BaseModel):
    category_id: str | None
    category_name: str
    total: Decimal
    percentage: float
