from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_owned_business
from app.core.database import get_db
from app.models.ai_insight import AiInsight
from app.models.business import Business
from app.schemas.insight import InsightRead, ProjectionRead
from app.services import insights_service

router = APIRouter(prefix="/businesses/{business_id}/insights", tags=["insights"])


@router.get("", response_model=list[InsightRead])
def list_insights(business: Business = Depends(get_owned_business), db: Session = Depends(get_db)) -> list[AiInsight]:
    return insights_service.generate_insights(db, business)


@router.get("/projection", response_model=ProjectionRead)
def get_projection(business: Business = Depends(get_owned_business), db: Session = Depends(get_db)) -> ProjectionRead:
    return insights_service.get_projection(db, business)
