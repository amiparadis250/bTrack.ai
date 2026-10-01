from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_owned_business
from app.core.database import get_db
from app.models.business import Business
from app.models.user import User
from app.repositories import business_repository
from app.schemas.business import BusinessCreateRequest, BusinessRead, BusinessUpdateRequest
from app.services import business_service

router = APIRouter(prefix="/businesses", tags=["businesses"])


@router.get("", response_model=list[BusinessRead])
def list_businesses(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> list[Business]:
    return business_repository.list_for_owner(db, current_user.id)


@router.post("", response_model=BusinessRead, status_code=status.HTTP_201_CREATED)
def create_business(
    data: BusinessCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Business:
    return business_service.create_business(db, current_user.id, data)


@router.get("/{business_id}", response_model=BusinessRead)
def get_business(business: Business = Depends(get_owned_business)) -> Business:
    return business


@router.patch("/{business_id}", response_model=BusinessRead)
def update_business(
    data: BusinessUpdateRequest,
    business: Business = Depends(get_owned_business),
    db: Session = Depends(get_db),
) -> Business:
    return business_service.update_business(db, business, data)
