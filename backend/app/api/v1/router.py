from fastapi import APIRouter

from app.api.v1 import ai, analytics, auth, businesses, categories, insights, reports, transactions, users

api_router = APIRouter(prefix="/api/v1")
api_router.include_router(auth.router)
api_router.include_router(users.router)
api_router.include_router(businesses.router)
api_router.include_router(categories.router)
api_router.include_router(transactions.router)
api_router.include_router(analytics.router)
api_router.include_router(ai.router)
api_router.include_router(insights.router)
api_router.include_router(reports.router)
