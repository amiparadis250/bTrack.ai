import time
from datetime import date, timedelta

from google import genai
from google.genai import types
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.models.business import Business
from app.services import analytics_service

settings = get_settings()

MODEL_NAME = "gemini-3.1-flash-lite"

VALID_PERIODS = ("today", "this_week", "this_month", "last_month", "this_quarter", "this_year")


class AIUnavailableError(Exception):
    """Raised when the AI provider can't be reached or isn't configured -- the rest of the app must keep working."""


def resolve_period(period: str, today: date | None = None) -> tuple[date, date]:
    today = today or date.today()
    period = (period or "this_month").lower().strip()

    if period == "today":
        return today, today
    if period == "this_week":
        return today - timedelta(days=today.weekday()), today
    if period == "last_month":
        first_this_month = today.replace(day=1)
        last_month_end = first_this_month - timedelta(days=1)
        return last_month_end.replace(day=1), last_month_end
    if period == "this_quarter":
        quarter_start_month = (today.month - 1) // 3 * 3 + 1
        return today.replace(month=quarter_start_month, day=1), today
    if period == "this_year":
        return today.replace(month=1, day=1), today
    # "this_month" and anything unrecognized
    return today.replace(day=1), today


def _build_tools(db: Session, business: Business) -> list:
    currency = business.currency

    def get_revenue(period: str) -> str:
        """Get total revenue (income + sales) for a period.

        Args:
            period: one of "today", "this_week", "this_month", "last_month", "this_quarter", "this_year".
        """
        start, end = resolve_period(period)
        overview = analytics_service.get_overview(db, business.id, start, end)
        return f"Revenue from {start} to {end}: {currency} {overview.revenue}"

    def get_expenses(period: str) -> str:
        """Get total expenses for a period.

        Args:
            period: one of "today", "this_week", "this_month", "last_month", "this_quarter", "this_year".
        """
        start, end = resolve_period(period)
        overview = analytics_service.get_overview(db, business.id, start, end)
        return f"Expenses from {start} to {end}: {currency} {overview.expenses}"

    def get_profit(period: str) -> str:
        """Get profit (revenue minus expenses) and profit margin for a period.

        Args:
            period: one of "today", "this_week", "this_month", "last_month", "this_quarter", "this_year".
        """
        start, end = resolve_period(period)
        overview = analytics_service.get_overview(db, business.id, start, end)
        margin = f"{overview.profit_margin:.1f}%" if overview.profit_margin is not None else "n/a (no revenue)"
        return f"Profit from {start} to {end}: {currency} {overview.profit} (margin: {margin})"

    def get_cash_flow(period: str) -> str:
        """Get cash inflow, outflow, and net cash flow for a period.

        Args:
            period: one of "today", "this_week", "this_month", "last_month", "this_quarter", "this_year".
        """
        start, end = resolve_period(period)
        overview = analytics_service.get_overview(db, business.id, start, end)
        return (
            f"Cash flow from {start} to {end}: inflow {currency} {overview.cash_inflow}, "
            f"outflow {currency} {overview.cash_outflow}, net {currency} {overview.net_cash_flow}"
        )

    def get_expense_breakdown(period: str) -> str:
        """Get expenses broken down by category for a period, largest first.

        Args:
            period: one of "today", "this_week", "this_month", "last_month", "this_quarter", "this_year".
        """
        start, end = resolve_period(period)
        items = analytics_service.get_expense_breakdown(db, business.id, start, end)
        if not items:
            return f"No expenses recorded from {start} to {end}."
        lines = [f"{item.category_name}: {currency} {item.total} ({item.percentage:.0f}%)" for item in items]
        return f"Expense breakdown from {start} to {end}:\n" + "\n".join(lines)

    def get_monthly_trend(months_back: int) -> str:
        """Get monthly revenue and expense totals for the last N months, oldest first.

        Args:
            months_back: how many months of history to return, e.g. 6.
        """
        months_back = max(1, min(months_back, 24))
        end = date.today()
        start = date(end.year, end.month, 1)
        for _ in range(months_back - 1):
            start = (start - timedelta(days=1)).replace(day=1)
        points = analytics_service.get_monthly_trend(db, business.id, start, end)
        if not points:
            return "No transaction history available for that range."
        lines = [f"{p.period}: revenue {currency} {p.revenue}, expenses {currency} {p.expenses}" for p in points]
        return "\n".join(lines)

    return [get_revenue, get_expenses, get_profit, get_cash_flow, get_expense_breakdown, get_monthly_trend]


def ask(db: Session, business: Business, message: str) -> str:
    if not settings.gemini_api_key:
        raise AIUnavailableError("The AI Assistant isn't configured yet.")

    system_instruction = (
        f"You are bTrack AI, a financial assistant for {business.name}, a {business.business_type} "
        f"business in Rwanda using currency {business.currency}. Today's date is {date.today().isoformat()}.\n\n"
        "Answer the user's question about their business finances using ONLY the provided tools to get real "
        "numbers -- never invent, estimate, or guess a financial figure yourself. If a tool returns a number, "
        "use it exactly as given. Keep answers concise (2-4 sentences), friendly, and respond in the same "
        "language the user asked in (English or Kinyarwanda). If the question isn't about this business's "
        "finances, politely redirect them to ask about revenue, expenses, profit, cash flow, or sales."
    )

    client = genai.Client(api_key=settings.gemini_api_key)
    config = types.GenerateContentConfig(system_instruction=system_instruction, tools=_build_tools(db, business))

    response = None
    last_error: Exception | None = None
    for attempt in range(2):
        try:
            response = client.models.generate_content(model=MODEL_NAME, contents=message, config=config)
            break
        except Exception as exc:  # noqa: BLE001 -- provider overload/network failures must degrade, not crash the request
            last_error = exc
            if attempt == 0:
                time.sleep(2)

    if response is None:
        raise AIUnavailableError("The AI Assistant is temporarily unavailable. Please try again shortly.") from last_error

    if not response.text:
        raise AIUnavailableError("The AI Assistant couldn't generate an answer. Please try rephrasing your question.")

    return response.text.strip()
