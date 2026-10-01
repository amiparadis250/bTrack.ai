"""Seed realistic sample transactions for an existing business.

Usage:
    python -m app.seed [owner_email] [months_back] [business_name]

Defaults to the smoke-test account's first business. Pass business_name when
an owner has more than one business.
"""

import random
import sys
from datetime import date, timedelta
from decimal import Decimal

from app.core.database import SessionLocal
from app.models.business import Business
from app.models.category import Category
from app.models.transaction import Transaction
from app.models.user import User

PAYMENT_METHODS = ["cash", "bank", "mobile_money", "card"]

SALE_DESCRIPTIONS = [
    "Sold assorted groceries",
    "Sold 10 crates of soda",
    "Walk-in customer sale",
    "Bulk order -- restaurant client",
    "Sold rice and cooking oil",
    "Weekend market sale",
]
SERVICE_DESCRIPTIONS = ["Delivery service fee", "Consulting fee", "Installation service"]
OTHER_INCOME_DESCRIPTIONS = ["Refund from supplier", "Interest on savings", "Miscellaneous income"]

EXPENSE_DESCRIPTIONS: dict[str, list[str]] = {
    "Inventory": ["Purchased stock from Kigali Wholesale", "Restocked shelves", "Bought 20 bags of rice"],
    "Rent": ["Monthly shop rent"],
    "Salaries": ["Staff salaries", "Part-time staff wages"],
    "Transport": ["Fuel for delivery van", "Moto transport for goods", "Transport to supplier"],
    "Utilities": ["Electricity bill", "Water bill", "Internet bill"],
    "Marketing": ["Facebook ads", "Printed flyers", "Radio ad spot"],
    "Equipment": ["Repaired refrigerator", "Bought new weighing scale"],
    "Taxes": ["RRA quarterly tax payment"],
    "Other": ["Miscellaneous expense", "Bank charges"],
}

# Relative weight of each expense category per month -- Inventory and Rent dominate, matching a typical retail SME.
EXPENSE_WEIGHTS = {
    "Inventory": 35,
    "Rent": 15,
    "Salaries": 15,
    "Transport": 10,
    "Utilities": 8,
    "Marketing": 6,
    "Equipment": 5,
    "Taxes": 4,
    "Other": 2,
}


def random_date_in_month(year: int, month: int) -> date:
    start = date(year, month, 1)
    next_month = date(year + 1, 1, 1) if month == 12 else date(year, month + 1, 1)
    day_offset = random.randint(0, (next_month - start).days - 1)
    return start + timedelta(days=day_offset)


def month_sequence(months_back: int) -> list[tuple[int, int]]:
    today = date.today()
    months = []
    year, month = today.year, today.month
    for _ in range(months_back):
        months.append((year, month))
        month -= 1
        if month == 0:
            month = 12
            year -= 1
    return list(reversed(months))


def seed(owner_email: str, months_back: int, business_name: str | None = None) -> None:
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == owner_email.lower()).first()
        if not user:
            print(f"No user found with email {owner_email}")
            return

        query = db.query(Business).filter(Business.owner_id == user.id)
        if business_name:
            query = query.filter(Business.name == business_name)
        business = query.first()
        if not business:
            print(f"No business found for {owner_email}" + (f" named '{business_name}'" if business_name else ""))
            return

        categories = db.query(Category).filter(Category.business_id == business.id).all()
        by_name = {c.name: c for c in categories}

        deleted = db.query(Transaction).filter(Transaction.business_id == business.id).delete()
        db.commit()
        print(f"Cleared {deleted} existing transactions for '{business.name}'.")

        created = 0
        for year, month in month_sequence(months_back):
            is_current_month = (year, month) == (date.today().year, date.today().month)
            day_cap = date.today().day if is_current_month else None

            def clamp(d: date) -> date:
                return min(d, date(year, month, day_cap)) if day_cap else d

            # Sales (3-6 per month)
            for _ in range(random.randint(3, 6)):
                db.add(
                    Transaction(
                        business_id=business.id,
                        category_id=by_name["Sales"].id,
                        type="sale",
                        amount=Decimal(random.randint(50_000, 500_000)),
                        description=random.choice(SALE_DESCRIPTIONS),
                        transaction_date=clamp(random_date_in_month(year, month)),
                        payment_method=random.choice(PAYMENT_METHODS),
                        source="manual",
                    )
                )
                created += 1

            # Income (0-2 per month): services or other income
            for _ in range(random.randint(0, 2)):
                use_services = random.random() < 0.7
                category = by_name["Services"] if use_services else by_name["Other Income"]
                description = random.choice(SERVICE_DESCRIPTIONS if use_services else OTHER_INCOME_DESCRIPTIONS)
                db.add(
                    Transaction(
                        business_id=business.id,
                        category_id=category.id,
                        type="income",
                        amount=Decimal(random.randint(20_000, 200_000)),
                        description=description,
                        transaction_date=clamp(random_date_in_month(year, month)),
                        payment_method=random.choice(PAYMENT_METHODS),
                        source="manual",
                    )
                )
                created += 1

            # Expenses -- weighted across categories, 1-3 transactions per category per month
            for category_name, weight in EXPENSE_WEIGHTS.items():
                if category_name not in by_name:
                    continue
                count = 1 if weight <= 6 else random.randint(1, 3)
                for _ in range(count):
                    base = weight * 4_000
                    amount = Decimal(max(5_000, int(random.gauss(base, base * 0.3))))
                    db.add(
                        Transaction(
                            business_id=business.id,
                            category_id=by_name[category_name].id,
                            type="expense",
                            amount=amount,
                            description=random.choice(EXPENSE_DESCRIPTIONS[category_name]),
                            transaction_date=clamp(random_date_in_month(year, month)),
                            payment_method=random.choice(PAYMENT_METHODS),
                            source="manual",
                        )
                    )
                    created += 1

        db.commit()
        print(f"Seeded {created} transactions across {months_back} months for '{business.name}'.")
    finally:
        db.close()


if __name__ == "__main__":
    random.seed(42)
    email = sys.argv[1] if len(sys.argv) > 1 else "smoketest@btrack.ai"
    months = int(sys.argv[2]) if len(sys.argv) > 2 else 6
    name = sys.argv[3] if len(sys.argv) > 3 else None
    seed(email, months, name)
