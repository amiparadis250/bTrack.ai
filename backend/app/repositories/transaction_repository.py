import uuid
from datetime import date

from sqlalchemy import Select, func, select
from sqlalchemy.orm import Session

from app.models.transaction import Transaction


def base_query(business_id: uuid.UUID) -> Select:
    return select(Transaction).where(Transaction.business_id == business_id)


def list_transactions(
    db: Session,
    business_id: uuid.UUID,
    *,
    type_: str | None = None,
    date_from: date | None = None,
    date_to: date | None = None,
    category_id: uuid.UUID | None = None,
    search: str | None = None,
    limit: int = 20,
    offset: int = 0,
) -> tuple[list[Transaction], int]:
    stmt = base_query(business_id)
    if type_:
        stmt = stmt.where(Transaction.type == type_)
    if date_from:
        stmt = stmt.where(Transaction.transaction_date >= date_from)
    if date_to:
        stmt = stmt.where(Transaction.transaction_date <= date_to)
    if category_id:
        stmt = stmt.where(Transaction.category_id == category_id)
    if search:
        stmt = stmt.where(Transaction.description.ilike(f"%{search}%"))

    total = db.scalar(select(func.count()).select_from(stmt.subquery())) or 0

    rows_stmt = stmt.order_by(Transaction.transaction_date.desc(), Transaction.created_at.desc()).limit(limit).offset(offset)
    rows = list(db.scalars(rows_stmt))
    return rows, total


def get_transaction(db: Session, business_id: uuid.UUID, transaction_id: uuid.UUID) -> Transaction | None:
    stmt = base_query(business_id).where(Transaction.id == transaction_id)
    return db.scalars(stmt).first()
