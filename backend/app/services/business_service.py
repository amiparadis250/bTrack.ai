import uuid

from sqlalchemy.orm import Session

from app.models.business import Business
from app.models.category import DEFAULT_EXPENSE_CATEGORIES, DEFAULT_INCOME_CATEGORIES, Category
from app.schemas.business import BusinessCreateRequest, BusinessUpdateRequest


def create_business(db: Session, owner_id: uuid.UUID, data: BusinessCreateRequest) -> Business:
    business = Business(
        owner_id=owner_id,
        name=data.name,
        business_type=data.validate_type(),
        phone=data.phone,
        email=data.email,
        location=data.location,
        currency=data.currency or "RWF",
        description=data.description,
    )
    db.add(business)
    db.flush()

    for name in DEFAULT_INCOME_CATEGORIES:
        db.add(Category(business_id=business.id, name=name, type="income", is_default=True))
    for name in DEFAULT_EXPENSE_CATEGORIES:
        db.add(Category(business_id=business.id, name=name, type="expense", is_default=True))

    db.commit()
    db.refresh(business)
    return business


def update_business(db: Session, business: Business, data: BusinessUpdateRequest) -> Business:
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(business, field, value)
    db.commit()
    db.refresh(business)
    return business
