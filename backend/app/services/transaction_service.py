import uuid

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.business import Business
from app.models.category import Category
from app.models.transaction import Transaction
from app.repositories import transaction_repository
from app.schemas.transaction import TransactionCreateRequest, TransactionUpdateRequest


def _validate_category(db: Session, business_id: uuid.UUID, category_id: uuid.UUID | None) -> None:
    if category_id is None:
        return
    category = db.get(Category, category_id)
    if not category or category.business_id != business_id:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Category does not belong to this business.")


def create_transaction(db: Session, business: Business, data: TransactionCreateRequest) -> Transaction:
    _validate_category(db, business.id, data.category_id)

    transaction = Transaction(
        business_id=business.id,
        category_id=data.category_id,
        type=data.type,
        amount=data.amount,
        description=data.description,
        transaction_date=data.transaction_date,
        payment_method=data.payment_method,
        reference=data.reference,
        notes=data.notes,
        source="manual",
    )
    db.add(transaction)
    db.commit()
    db.refresh(transaction)
    return transaction


def update_transaction(
    db: Session, business: Business, transaction: Transaction, data: TransactionUpdateRequest
) -> Transaction:
    updates = data.model_dump(exclude_unset=True)
    if "category_id" in updates:
        _validate_category(db, business.id, updates["category_id"])
    for field, value in updates.items():
        setattr(transaction, field, value)
    db.commit()
    db.refresh(transaction)
    return transaction


def delete_transaction(db: Session, transaction: Transaction) -> None:
    db.delete(transaction)
    db.commit()


def get_transaction_or_404(db: Session, business: Business, transaction_id: uuid.UUID) -> Transaction:
    transaction = transaction_repository.get_transaction(db, business.id, transaction_id)
    if not transaction:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Transaction not found.")
    return transaction
