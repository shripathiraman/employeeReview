import os
from typing import Any

import psycopg
from fastapi import HTTPException, status
from dotenv import load_dotenv
from psycopg.rows import dict_row


load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))


def _connect() -> psycopg.Connection:
    """Open a PostgreSQL connection for repository operations.
    """
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database configuration is unavailable.",
        )
    try:
        return psycopg.connect(database_url, row_factory=dict_row)
    except psycopg.Error as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database service is unavailable.",
        ) from exc


def list_employees() -> list[dict[str, Any]]:
    """Return all employees ordered by their database identifier.
    """
    try:
        with _connect() as connection:
            with connection.cursor() as cursor:
                cursor.execute(
                    """
                    SELECT id, employee_id, name, department, email, status
                    FROM employees
                    ORDER BY id
                    """
                )
                return list(cursor.fetchall())
    except psycopg.Error as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to retrieve employees.",
        ) from exc


def list_review_periods() -> list[dict[str, Any]]:
    """Return review periods ordered from newest to oldest.
    """
    try:
        with _connect() as connection:
            with connection.cursor() as cursor:
                cursor.execute(
                    """
                    SELECT id, name, start_date, end_date, status
                    FROM review_periods
                    ORDER BY start_date DESC, id DESC
                    """
                )
                return list(cursor.fetchall())
    except psycopg.Error as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to retrieve review periods.",
        ) from exc


_REVIEW_SELECT = """
    SELECT
        pr.id,
        pr.employee_id,
        e.name AS employee_name,
        pr.period_id,
        rp.name AS period_name,
        pr.quality_rating,
        pr.delivery_rating,
        pr.teamwork_rating,
        pr.average_rating::double precision AS average_rating,
        pr.comments,
        pr.created_at
    FROM performance_reviews AS pr
    JOIN employees AS e ON e.id = pr.employee_id
    JOIN review_periods AS rp ON rp.id = pr.period_id
"""


def list_reviews(
    *,
    employee_id: int | None = None,
    period_id: int | None = None,
    limit: int = 100,
    offset: int = 0,
) -> list[dict[str, Any]]:
    """Return filtered reviews using pagination parameters.
    """
    conditions: list[str] = []
    values: list[Any] = []

    if employee_id is not None:
        conditions.append("pr.employee_id = %s")
        values.append(employee_id)
    if period_id is not None:
        conditions.append("pr.period_id = %s")
        values.append(period_id)

    query = _REVIEW_SELECT
    if conditions:
        query += " WHERE " + " AND ".join(conditions)
    query += " ORDER BY pr.created_at DESC, pr.id DESC LIMIT %s OFFSET %s"
    values.extend((limit, offset))

    try:
        with _connect() as connection:
            with connection.cursor() as cursor:
                cursor.execute(query, values)
                return list(cursor.fetchall())
    except psycopg.Error as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to retrieve reviews.",
        ) from exc


def get_review(review_id: int) -> dict[str, Any] | None:
    """Return one review by identifier, or None when it does not exist.
    """
    try:
        with _connect() as connection:
            with connection.cursor() as cursor:
                cursor.execute(_REVIEW_SELECT + " WHERE pr.id = %s", (review_id,))
                return cursor.fetchone()
    except psycopg.Error as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to retrieve the review.",
        ) from exc


def create_review(review: dict[str, Any]) -> dict[str, Any]:
    """Create a review and return the persisted review record.
    """
    try:
        with _connect() as connection:
            with connection.cursor() as cursor:
                cursor.execute(
                    """
                    INSERT INTO performance_reviews (
                        employee_id, period_id, quality_rating,
                        delivery_rating, teamwork_rating, average_rating, comments
                    )
                    VALUES (%s, %s, %s, %s, %s, %s, %s)
                    RETURNING id
                    """,
                    (
                        review["employee_id"],
                        review["period_id"],
                        review["quality_rating"],
                        review["delivery_rating"],
                        review["teamwork_rating"],
                        review["average_rating"],
                        review.get("comments"),
                    ),
                )
                new_id = cursor.fetchone()["id"]
                cursor.execute(_REVIEW_SELECT + " WHERE pr.id = %s", (new_id,))
                return cursor.fetchone()
    except psycopg.errors.UniqueViolation as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A review already exists for this employee and period.",
        ) from exc
    except psycopg.Error as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to create the review.",
        ) from exc


def get_employee(employee_id: str) -> dict[str, Any] | None:
    """Find one employee using their employee code."""
    try:
        with _connect() as connection:
            with connection.cursor() as cursor:
                cursor.execute(
                    """
                    SELECT id, employee_id, name, department, email, status
                    FROM employees
                    WHERE employee_id = %s
                    """,
                    (employee_id,),
                )
                return cursor.fetchone()
    except psycopg.Error as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to retrieve employee.",
        ) from exc


def upsert_employee(employee: dict[str, Any]) -> dict[str, Any]:
    """Insert a new employee or update the employee with the same code."""
    try:
        with _connect() as connection:
            with connection.cursor() as cursor:
                cursor.execute(
                    """
                    INSERT INTO employees (
                        employee_id, name, department, email, status
                    )
                    VALUES (%s, %s, %s, %s, %s)
                    ON CONFLICT (employee_id) DO UPDATE
                    SET
                        name = EXCLUDED.name,
                        department = EXCLUDED.department,
                        email = EXCLUDED.email,
                        status = EXCLUDED.status
                    RETURNING id, employee_id, name, department, email, status
                    """,
                    (
                        employee["employee_id"],
                        employee["name"],
                        employee["department"],
                        employee["email"],
                        employee["status"],
                    ),
                )
                return cursor.fetchone()
    except psycopg.Error as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to save employee.",
        ) from exc