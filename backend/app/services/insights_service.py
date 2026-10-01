from datetime import date, timedelta
from decimal import Decimal
from typing import Any

from sqlalchemy.orm import Session

from app.models.ai_insight import AiInsight
from app.models.business import Business
from app.schemas.insight import ProjectionPoint, ProjectionRead
from app.services import analytics_service

# Thresholds below which a change is noise, not a noteworthy insight.
REVENUE_CHANGE_THRESHOLD = 10.0
EXPENSE_CATEGORY_CHANGE_THRESHOLD = 20.0
EXPENSE_CONCENTRATION_THRESHOLD = 30.0
MARGIN_CHANGE_THRESHOLD = 5.0

PROJECTION_MONTHS_BACK = 6
MIN_MONTHS_FOR_PROJECTION = 2


def _month_bounds(today: date, months_back: int) -> tuple[date, date]:
    year, month = today.year, today.month - months_back
    while month <= 0:
        month += 12
        year -= 1
    start = date(year, month, 1)
    if months_back == 0:
        return start, today
    end = (date(year, month + 1, 1) if month < 12 else date(year + 1, 1, 1)) - timedelta(days=1)
    return start, end


def _candidates(db: Session, business: Business, today: date) -> tuple[list[dict[str, Any]], date, date]:
    this_start, this_end = _month_bounds(today, 0)
    last_start, last_end = _month_bounds(today, 1)

    this_overview = analytics_service.get_overview(db, business.id, this_start, this_end)
    last_overview = analytics_service.get_overview(db, business.id, last_start, last_end)
    this_breakdown = analytics_service.get_expense_breakdown(db, business.id, this_start, this_end)
    last_breakdown = analytics_service.get_expense_breakdown(db, business.id, last_start, last_end)

    candidates: list[dict[str, Any]] = []

    if last_overview.revenue > 0:
        pct = float((this_overview.revenue - last_overview.revenue) / last_overview.revenue * 100)
        if abs(pct) >= REVENUE_CHANGE_THRESHOLD:
            growing = pct > 0
            candidates.append(
                {
                    "type": "revenue_growth" if growing else "revenue_decline",
                    "title": "Sales Growth" if growing else "Sales Decline",
                    "description": (
                        f"Your revenue {'increased' if growing else 'decreased'} by {abs(pct):.0f}% "
                        "compared with last month."
                    ),
                    "supporting_data": {
                        "this_month": str(this_overview.revenue),
                        "last_month": str(last_overview.revenue),
                        "change_percent": round(pct, 1),
                    },
                }
            )

    last_by_category = {item.category_name: Decimal(item.total) for item in last_breakdown}
    biggest_increase: dict[str, Any] | None = None
    for item in this_breakdown:
        previous = last_by_category.get(item.category_name)
        if previous and previous > 0:
            pct = float((Decimal(item.total) - previous) / previous * 100)
            if pct >= EXPENSE_CATEGORY_CHANGE_THRESHOLD and (
                biggest_increase is None or pct > biggest_increase["pct"]
            ):
                biggest_increase = {"category": item.category_name, "pct": pct, "amount": str(item.total)}
    if biggest_increase:
        candidates.append(
            {
                "type": "expense_increase",
                "title": "Expense Change",
                "description": (
                    f"{biggest_increase['category']} expenses increased by {biggest_increase['pct']:.0f}% "
                    "compared with last month."
                ),
                "supporting_data": biggest_increase,
            }
        )

    if this_breakdown:
        top = this_breakdown[0]
        if top.percentage >= EXPENSE_CONCENTRATION_THRESHOLD:
            candidates.append(
                {
                    "type": "expense_concentration",
                    "title": "Expense Concentration",
                    "description": (
                        f"{top.category_name} represents {top.percentage:.0f}% of your total expenses this month "
                        "-- a significant share."
                    ),
                    "supporting_data": {"category": top.category_name, "percentage": top.percentage},
                }
            )

    if this_overview.profit_margin is not None and last_overview.profit_margin is not None:
        delta = this_overview.profit_margin - last_overview.profit_margin
        if abs(delta) >= MARGIN_CHANGE_THRESHOLD:
            improved = delta > 0
            candidates.append(
                {
                    "type": "margin_change",
                    "title": "Profit Margin Change",
                    "description": (
                        f"Your profit margin {'improved' if improved else 'declined'} by {abs(delta):.1f} "
                        "percentage points compared with last month."
                    ),
                    "supporting_data": {
                        "this_month": this_overview.profit_margin,
                        "last_month": last_overview.profit_margin,
                    },
                }
            )

    return candidates, this_start, this_end


def generate_insights(db: Session, business: Business) -> list[AiInsight]:
    candidates, period_start, period_end = _candidates(db, business, date.today())

    saved: list[AiInsight] = []
    for candidate in candidates:
        existing = (
            db.query(AiInsight)
            .filter(
                AiInsight.business_id == business.id,
                AiInsight.type == candidate["type"],
                AiInsight.period_start == period_start,
                AiInsight.period_end == period_end,
            )
            .first()
        )
        if existing:
            existing.title = candidate["title"]
            existing.description = candidate["description"]
            existing.supporting_data = candidate["supporting_data"]
            saved.append(existing)
        else:
            insight = AiInsight(
                business_id=business.id,
                type=candidate["type"],
                title=candidate["title"],
                description=candidate["description"],
                period_start=period_start,
                period_end=period_end,
                supporting_data=candidate["supporting_data"],
            )
            db.add(insight)
            saved.append(insight)

    db.commit()
    for insight in saved:
        db.refresh(insight)
    return sorted(saved, key=lambda i: i.created_at, reverse=True)


def _linear_projection(values: list[float]) -> float:
    """Least-squares projection of the next point in a monthly series. Deterministic
    arithmetic, not an AI guess -- revenue/expenses can't go negative, so the floor is 0."""
    n = len(values)
    if n == 0:
        return 0.0
    if n == 1:
        return values[0]

    xs = list(range(n))
    mean_x = sum(xs) / n
    mean_y = sum(values) / n
    denominator = sum((x - mean_x) ** 2 for x in xs)
    if denominator == 0:
        return values[-1]

    slope = sum((x - mean_x) * (y - mean_y) for x, y in zip(xs, values)) / denominator
    intercept = mean_y - slope * mean_x
    return max(slope * n + intercept, 0.0)


def get_projection(db: Session, business: Business) -> ProjectionRead:
    end = date.today()
    start, _ = _month_bounds(end, PROJECTION_MONTHS_BACK - 1)
    points = analytics_service.get_monthly_trend(db, business.id, start, end)

    history = [ProjectionPoint(period=p.period, revenue=p.revenue, expenses=p.expenses) for p in points]

    if len(points) < MIN_MONTHS_FOR_PROJECTION:
        return ProjectionRead(
            has_enough_data=False,
            based_on_months=len(points),
            history=history,
            projected_revenue=None,
            projected_expenses=None,
            projected_profit=None,
        )

    revenue_values = [float(p.revenue) for p in points]
    expense_values = [float(p.expenses) for p in points]
    projected_revenue = Decimal(str(round(_linear_projection(revenue_values), 2)))
    projected_expenses = Decimal(str(round(_linear_projection(expense_values), 2)))

    return ProjectionRead(
        has_enough_data=True,
        based_on_months=len(points),
        history=history,
        projected_revenue=projected_revenue,
        projected_expenses=projected_expenses,
        projected_profit=projected_revenue - projected_expenses,
    )
