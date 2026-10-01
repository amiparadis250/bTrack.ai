import uuid

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.business import Business


def get_by_id(db: Session, business_id: uuid.UUID) -> Business | None:
    return db.get(Business, business_id)


def list_for_owner(db: Session, owner_id: uuid.UUID) -> list[Business]:
    stmt = select(Business).where(Business.owner_id == owner_id).order_by(Business.created_at)
    return list(db.scalars(stmt))
