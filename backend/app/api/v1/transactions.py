import uuid
from datetime import date

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.api.deps import get_owned_business
from app.core.database import get_db
from app.models.business import Business
from app.models.transaction import Transaction
from app.repositories import transaction_repository
from app.schemas.common import Page
from app.schemas.transaction import TransactionCreateRequest, TransactionRead, TransactionUpdateRequest
from app.services import transaction_service

router = APIRouter(prefix="/businesses/{business_id}/transactions", tags=["transactions"])


@router.get("", response_model=Page[TransactionRead])
def list_transactions(
    business: Business = Depends(get_owned_business),
    db: Session = Depends(get_db),
    type: str | None = Query(default=None),
    date_from: date | None = Query(default=None),
    date_to: date | None = Query(default=None),
    category_id: uuid.UUID | None = Query(default=None),
    search: str | None = Query(default=None),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
) -> Page[TransactionRead]:
    rows, total = transaction_repository.list_transactions(
        db,
        business.id,
        type_=type,
        date_from=date_from,
        date_to=date_to,
        category_id=category_id,
        search=search,
        limit=page_size,
        offset=(page - 1) * page_size,
    )
    return Page(items=rows, total=total, page=page, page_size=page_size)


@router.post("", response_model=TransactionRead, status_code=status.HTTP_201_CREATED)
def create_transaction(
    data: TransactionCreateRequest,
    business: Business = Depends(get_owned_business),
    db: Session = Depends(get_db),
) -> Transaction:
    return transaction_service.create_transaction(db, business, data)


@router.get("/{transaction_id}", response_model=TransactionRead)
def get_transaction(
    transaction_id: uuid.UUID,
    business: Business = Depends(get_owned_business),
    db: Session = Depends(get_db),
) -> Transaction:
    return transaction_service.get_transaction_or_404(db, business, transaction_id)


@router.put("/{transaction_id}", response_model=TransactionRead)
def update_transaction(
    transaction_id: uuid.UUID,
    data: TransactionUpdateRequest,
    business: Business = Depends(get_owned_business),
    db: Session = Depends(get_db),
) -> Transaction:
    transaction = transaction_service.get_transaction_or_404(db, business, transaction_id)
    return transaction_service.update_transaction(db, business, transaction, data)


@router.delete("/{transaction_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_transaction(
    transaction_id: uuid.UUID,
    business: Business = Depends(get_owned_business),
    db: Session = Depends(get_db),
) -> None:
    transaction = transaction_service.get_transaction_or_404(db, business, transaction_id)
    transaction_service.delete_transaction(db, transaction)
