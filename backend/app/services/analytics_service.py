import uuid
from datetime import date
from decimal import Decimal

from sqlalchemy import case, func, select
from sqlalchemy.orm import Session

from app.models.category import Category
from app.models.transaction import Transaction
from app.schemas.analytics import AnalyticsOverview, CategoryBreakdownItem, TrendPoint

ZERO = Decimal("0.00")


def get_overview(db: Session, business_id: uuid.UUID, start: date, end: date) -> AnalyticsOverview:
    income_sum = func.coalesce(
        func.sum(case((Transaction.type.in_(("income", "sale")), Transaction.amount), else_=0)), 0
    )
    expense_sum = func.coalesce(func.sum(case((Transaction.type == "expense", Transaction.amount), else_=0)), 0)
    count = func.count(Transaction.id)

    stmt = select(income_sum, expense_sum, count).where(
        Transaction.business_id == business_id,
        Transaction.transaction_date >= start,
        Transaction.transaction_date <= end,
    )
    revenue, expenses, transaction_count = db.execute(stmt).one()
    revenue = Decimal(revenue)
    expenses = Decimal(expenses)
    profit = revenue - expenses
    profit_margin = float(profit / revenue * 100) if revenue > ZERO else None

    return AnalyticsOverview(
        period_start=start,
        period_end=end,
        revenue=revenue,
        expenses=expenses,
        profit=profit,
        profit_margin=profit_margin,
        cash_inflow=revenue,
        cash_outflow=expenses,
        net_cash_flow=profit,
        transaction_count=transaction_count,
    )


def get_monthly_trend(db: Session, business_id: uuid.UUID, start: date, end: date) -> list[TrendPoint]:
    month_key = func.to_char(Transaction.transaction_date, "YYYY-MM")
    income_sum = func.coalesce(
        func.sum(case((Transaction.type.in_(("income", "sale")), Transaction.amount), else_=0)), 0
    )
    expense_sum = func.coalesce(func.sum(case((Transaction.type == "expense", Transaction.amount), else_=0)), 0)

    stmt = (
        select(month_key.label("period"), income_sum.label("revenue"), expense_sum.label("expenses"))
        .where(
            Transaction.business_id == business_id,
            Transaction.transaction_date >= start,
            Transaction.transaction_date <= end,
        )
        .group_by(month_key)
        .order_by(month_key)
    )
    return [
        TrendPoint(period=row.period, revenue=Decimal(row.revenue), expenses=Decimal(row.expenses))
        for row in db.execute(stmt)
    ]


def get_expense_breakdown(db: Session, business_id: uuid.UUID, start: date, end: date) -> list[CategoryBreakdownItem]:
    total_stmt = select(func.coalesce(func.sum(Transaction.amount), 0)).where(
        Transaction.business_id == business_id,
        Transaction.type == "expense",
        Transaction.transaction_date >= start,
        Transaction.transaction_date <= end,
    )
    total = Decimal(db.scalar(total_stmt) or 0)

    category_name = func.coalesce(Category.name, "Uncategorized")
    stmt = (
        select(Transaction.category_id, category_name.label("name"), func.sum(Transaction.amount).label("total"))
        .outerjoin(Category, Category.id == Transaction.category_id)
        .where(
            Transaction.business_id == business_id,
            Transaction.type == "expense",
            Transaction.transaction_date >= start,
            Transaction.transaction_date <= end,
        )
        .group_by(Transaction.category_id, category_name)
        .order_by(func.sum(Transaction.amount).desc())
    )

    items = []
    for row in db.execute(stmt):
        row_total = Decimal(row.total)
        percentage = float(row_total / total * 100) if total > ZERO else 0.0
        items.append(
            CategoryBreakdownItem(
                category_id=str(row.category_id) if row.category_id else None,
                category_name=row.name,
                total=row_total,
                percentage=percentage,
            )
        )
    return items
