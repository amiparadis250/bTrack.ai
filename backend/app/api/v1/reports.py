import uuid

from fastapi import APIRouter, Depends, Response, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_owned_business
from app.core.database import get_db
from app.models.business import Business
from app.models.report import Report
from app.schemas.report import ReportCreateRequest, ReportRead
from app.services import report_service

router = APIRouter(prefix="/businesses/{business_id}/reports", tags=["reports"])


@router.get("", response_model=list[ReportRead])
def list_reports(business: Business = Depends(get_owned_business), db: Session = Depends(get_db)) -> list[Report]:
    stmt = (
        select(Report).where(Report.business_id == business.id).order_by(Report.created_at.desc()).limit(50)
    )
    return list(db.scalars(stmt))


@router.post("", response_model=ReportRead, status_code=status.HTTP_201_CREATED)
def create_report(
    data: ReportCreateRequest,
    business: Business = Depends(get_owned_business),
    db: Session = Depends(get_db),
) -> Report:
    return report_service.create_report(
        db, business, data.report_type, data.format, data.period_start, data.period_end
    )


@router.get("/{report_id}/download")
def download_report(
    report_id: uuid.UUID,
    business: Business = Depends(get_owned_business),
    db: Session = Depends(get_db),
) -> Response:
    report = report_service.get_report_or_404(db, business, report_id)
    content, filename = report_service.build_report_file(db, business, report)
    return Response(
        content=content,
        media_type=report_service.CONTENT_TYPES[report.format],
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
