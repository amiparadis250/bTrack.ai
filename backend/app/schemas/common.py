from typing import Any, Generic, TypeVar

from pydantic import BaseModel

T = TypeVar("T")


class ApiError(BaseModel):
    code: str
    message: str
    details: Any | None = None


class ApiErrorResponse(BaseModel):
    success: bool = False
    error: ApiError


class Page(BaseModel, Generic[T]):
    items: list[T]
    total: int
    page: int
    page_size: int
