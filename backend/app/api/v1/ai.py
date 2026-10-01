from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_owned_business
from app.core.database import get_db
from app.models.business import Business
from app.schemas.ai import ChatRequest, ChatResponse
from app.services import ai_service

router = APIRouter(prefix="/businesses/{business_id}/ai", tags=["ai"])


@router.post("/chat", response_model=ChatResponse)
def chat(
    data: ChatRequest,
    business: Business = Depends(get_owned_business),
    db: Session = Depends(get_db),
) -> ChatResponse:
    try:
        answer = ai_service.ask(db, business, data.message)
    except ai_service.AIUnavailableError as exc:
        raise HTTPException(status.HTTP_503_SERVICE_UNAVAILABLE, str(exc)) from exc
    return ChatResponse(answer=answer)
