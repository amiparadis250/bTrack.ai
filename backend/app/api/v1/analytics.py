from datetime import date, timedelta

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.deps import get_owned_business
from app.core.database import get_db
from app.models.business import Business
from app.schemas.analytics import AnalyticsOverview, CategoryBreakdownItem, TrendPoint
from app.services import analytics_service

router = APIRouter(prefix="/businesses/{business_id}/analytics", tags=["analytics"])


def _default_range(date_from: date | None, date_to: date | None) -> tuple[date, date]:
    end = date_to or date.today()
    start = date_from or end.replace(day=1)
    return start, end


@router.get("/overview", response_model=AnalyticsOverview)
def overview(
    business: Business = Depends(get_owned_business),
    db: Session = Depends(get_db),
    date_from: date | None = Query(default=None),
    date_to: date | None = Query(default=None),
) -> AnalyticsOverview:
    start, end = _default_range(date_from, date_to)
    return analytics_service.get_overview(db, business.id, start, end)


@router.get("/trend", response_model=list[TrendPoint])
def trend(
    business: Business = Depends(get_owned_business),
    db: Session = Depends(get_db),
    date_from: date | None = Query(default=None),
    date_to: date | None = Query(default=None),
) -> list[TrendPoint]:
    end = date_to or date.today()
    start = date_from or (end - timedelta(days=180))
    return analytics_service.get_monthly_trend(db, business.id, start, end)


@router.get("/expense-breakdown", response_model=list[CategoryBreakdownItem])
def expense_breakdown(
    business: Business = Depends(get_owned_business),
    db: Session = Depends(get_db),
    date_from: date | None = Query(default=None),
    date_to: date | None = Query(default=None),
) -> list[CategoryBreakdownItem]:
    start, end = _default_range(date_from, date_to)
    return analytics_service.get_expense_breakdown(db, business.id, start, end)
