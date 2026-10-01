import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, String, UniqueConstraint, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

CATEGORY_TYPES = ("income", "expense")

DEFAULT_INCOME_CATEGORIES = ["Sales", "Services", "Other Income"]
DEFAULT_EXPENSE_CATEGORIES = [
    "Inventory",
    "Rent",
    "Salaries",
    "Transport",
    "Utilities",
    "Marketing",
    "Equipment",
    "Taxes",
    "Other",
]


class Category(Base):
    __tablename__ = "transaction_categories"
    __table_args__ = (UniqueConstraint("business_id", "name", "type", name="uq_category_business_name_type"),)

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    business_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("businesses.id", ondelete="CASCADE"), nullable=False, index=True
    )
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    type: Mapped[str] = mapped_column(String(20), nullable=False)
    is_default: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    business: Mapped["Business"] = relationship(back_populates="categories")
    transactions: Mapped[list["Transaction"]] = relationship(back_populates="category")
