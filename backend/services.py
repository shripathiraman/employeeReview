import psycopg
from fastapi import HTTPException

import repository


def calculate_average_rating(review_data: dict) -> float:
    """Calculate the average of the three performance ratings.
    """
    return round(
        (
            review_data["quality_rating"]
            + review_data["delivery_rating"]
            + review_data["teamwork_rating"]
        )
        / 3,
        2,
    )


def get_employees():
    """Return employees or translate database failures to HTTP errors.
    """
    try:
        return repository.list_employees()
    except (psycopg.OperationalError, RuntimeError) as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc


def get_review_periods():
    """Return review periods or translate database failures to HTTP errors.
    """
    try:
        return repository.list_review_periods()
    except (psycopg.OperationalError, RuntimeError) as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc


def get_reviews(
    *, employee_id: int | None, period_id: int | None, limit: int, offset: int
):
    """Return filtered reviews with pagination support.
    """
    try:
        return repository.list_reviews(
            employee_id=employee_id,
            period_id=period_id,
            limit=limit,
            offset=offset,
        )
    except (psycopg.OperationalError, RuntimeError) as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc


def get_review(review_id: int):
    """Return one review or raise an HTTP 404 when absent.
    """
    try:
        review = repository.get_review(review_id)
    except (psycopg.OperationalError, RuntimeError) as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc

    if review is None:
        raise HTTPException(status_code=404, detail="Review not found")
    return review


def submit_review(review_data: dict):
    """Create a review and map database failures to HTTP errors.
    """
    review_data = {
        **review_data,
        "average_rating": calculate_average_rating(review_data),
    }
    try:
        return repository.create_review(review_data)
    except psycopg.errors.ForeignKeyViolation as exc:
        raise HTTPException(
            status_code=404, detail="Employee or review period was not found"
        ) from exc
    except psycopg.errors.UniqueViolation as exc:
        raise HTTPException(
            status_code=409,
            detail="This employee already has a review for that period",
        ) from exc
    except psycopg.errors.RaiseException as exc:
        raise HTTPException(status_code=422, detail=str(exc.diag.message_primary)) from exc
    except (psycopg.OperationalError, RuntimeError) as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc


def get_employee(employee_id: str):
    """Return one employee or raise a 404 error if they do not exist."""
    employee = repository.get_employee(employee_id)

    if employee is None:
        raise HTTPException(status_code=404, detail="Employee not found")

    return employee


def upsert_employee(employee_data: dict):
    """Insert or update an employee."""
    try:
        return repository.upsert_employee(employee_data)
    except (psycopg.OperationalError, RuntimeError) as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc


def get_review_period(period_id: int):
    """Return one review period or raise a 404 error if it does not exist."""
    period = repository.get_review_period(period_id)

    if period is None:
        raise HTTPException(status_code=404, detail="Review period not found.")

    return period


def upsert_review_period(period_data: dict):
    """Insert or update a review period."""
    try:
        return repository.upsert_review_period(period_data)
    except (psycopg.OperationalError, RuntimeError) as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc