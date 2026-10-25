

from fastapi import APIRouter, HTTPException, Query, status

from models import ReviewCreate, ReviewResponse
from service import (
    ConflictError,
    NotFoundError,
    ValidationError,
    get_review_details,
    list_employees,
    list_review_periods,
    list_reviews,
    submit_review,
)

router = APIRouter()


@router.get("/health", tags=["Health"])
def health_check():
    return {"status": "healthy"}


@router.get("/employees", tags=["Employees"])
def get_employees():
    return list_employees()


@router.get("/review-periods", tags=["Review Periods"])
def get_review_periods():
    return list_review_periods()


@router.get("/reviews", tags=["Reviews"])
def get_reviews(
    employee_id: int | None = Query(default=None, ge=1),
    period_id: int | None = Query(default=None, ge=1),
):
    return list_reviews(
        employee_id=employee_id,
        period_id=period_id,
    )


@router.get("/reviews/{review_id}", tags=["Reviews"])
def get_review(review_id: int):
    try:
        return get_review_details(review_id)
    except NotFoundError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        ) from exc


@router.post(
    "/reviews",
    tags=["Reviews"],
    status_code=status.HTTP_201_CREATED,
    response_model=ReviewResponse,
)
def create_review(review: ReviewCreate):
    try:
        return submit_review(review.model_dump())
    except NotFoundError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        ) from exc
    except ConflictError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(exc),
        ) from exc
    except ValidationError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(exc),
        ) from exc
