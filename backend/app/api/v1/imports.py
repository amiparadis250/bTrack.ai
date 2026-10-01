from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_owned_business
from app.core.database import get_db
from app.models.business import Business
from app.models.uploaded_file import UploadedFile
from app.schemas.imports import (
    AnalyzeResponse,
    ConfirmRequest,
    ConfirmResponse,
    ParsedRow,
    UploadedFileRead,
    ValidateRequest,
    ValidateResponse,
)
from app.services import import_service

router = APIRouter(prefix="/businesses/{business_id}/imports", tags=["imports"])


@router.get("", response_model=list[UploadedFileRead])
def list_imports(business: Business = Depends(get_owned_business), db: Session = Depends(get_db)) -> list[UploadedFile]:
    stmt = select(UploadedFile).where(UploadedFile.business_id == business.id).order_by(UploadedFile.created_at.desc())
    return list(db.scalars(stmt))


@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze(
    file: UploadFile = File(...),
    business: Business = Depends(get_owned_business),
) -> AnalyzeResponse:
    content = await file.read()
    try:
        columns, rows = import_service.parse_file(file.filename or "upload.csv", content)
    except import_service.ImportError_ as exc:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, str(exc)) from exc

    return AnalyzeResponse(
        filename=file.filename or "upload.csv",
        row_count=len(rows),
        columns=columns,
        suggested_mapping=import_service.suggest_mapping(columns),
        rows=[ParsedRow(row_number=i + 1, raw=row) for i, row in enumerate(rows)],
    )


@router.post("/validate", response_model=ValidateResponse)
def validate(
    data: ValidateRequest,
    business: Business = Depends(get_owned_business),
    db: Session = Depends(get_db),
) -> ValidateResponse:
    return import_service.validate_rows(db, business, data.rows, data.mapping)


@router.post("/confirm", response_model=ConfirmResponse)
def confirm(
    data: ConfirmRequest,
    business: Business = Depends(get_owned_business),
    db: Session = Depends(get_db),
) -> ConfirmResponse:
    count = import_service.confirm_import(db, business, data.filename, data.rows)
    return ConfirmResponse(imported_count=count)
