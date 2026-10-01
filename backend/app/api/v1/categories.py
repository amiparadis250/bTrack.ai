from fastapi import APIRouter, Depends, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_owned_business
from app.core.database import get_db
from app.models.business import Business
from app.models.category import Category
from app.schemas.category import CategoryCreateRequest, CategoryRead

router = APIRouter(prefix="/businesses/{business_id}/categories", tags=["categories"])


@router.get("", response_model=list[CategoryRead])
def list_categories(business: Business = Depends(get_owned_business), db: Session = Depends(get_db)) -> list[Category]:
    stmt = select(Category).where(Category.business_id == business.id).order_by(Category.type, Category.name)
    return list(db.scalars(stmt))


@router.post("", response_model=CategoryRead, status_code=status.HTTP_201_CREATED)
def create_category(
    data: CategoryCreateRequest,
    business: Business = Depends(get_owned_business),
    db: Session = Depends(get_db),
) -> Category:
    category = Category(business_id=business.id, name=data.name, type=data.validated_type(), is_default=False)
    db.add(category)
    db.commit()
    db.refresh(category)
    return category
