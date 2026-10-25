from fastapi import APIRouter, Query, status

import services
from models import (
    EmployeeResponse,
    ReviewCreate,
    ReviewPeriodResponse,
    ReviewResponse,
)

router = APIRouter(prefix="/api")


@router.get("/health", tags=["Health"])
def health_check():
    return {
        "status": "ok",
        "message": "Employee Review Application API is up and running",
    }


@router.get("/employees", response_model=list[EmployeeResponse], tags=["Employees"])
def read_employees():
    return services.get_employees()


@router.get(
    "/review-periods",
    response_model=list[ReviewPeriodResponse],
    tags=["Review periods"],
)
def read_review_periods():
    return services.get_review_periods()


@router.get("/reviews", response_model=list[ReviewResponse], tags=["Reviews"])
def read_reviews(
    employee_id: int | None = Query(default=None, gt=0),
    period_id: int | None = Query(default=None, gt=0),
    limit: int = Query(default=100, ge=1, le=500),
    offset: int = Query(default=0, ge=0),
):
    return services.get_reviews(
        employee_id=employee_id,
        period_id=period_id,
        limit=limit,
        offset=offset,
    )


@router.get(
    "/reviews/{review_id}", response_model=ReviewResponse, tags=["Reviews"]
)
def read_review(review_id: int):
    return services.get_review(review_id)


@router.post(
    "/reviews",
    response_model=ReviewResponse,
    status_code=status.HTTP_201_CREATED,
    tags=["Reviews"],
)
def create_review(review: ReviewCreate):
    return services.submit_review(review.model_dump())
