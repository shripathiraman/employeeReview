"""
model.py — Pydantic Models for EPRMS
Employee Performance Review Management System

Aligns with:
  - OpenAPI 3.0.3 spec (employee-performance-review-openapi.json)
  - Database design: employees, review_periods, performance_reviews
  - Business rules:
      * Ratings must be integers 1–5
      * Comments are mandatory (non-whitespace)
      * average_rating = ROUND((quality + delivery + teamwork) / 3, 2) — server-calculated
      * One employee can have only one review per period
      * Only Open review periods accept new submissions
"""

from datetime import date, datetime
from typing import Literal, Optional
from pydantic import BaseModel, EmailStr, Field, field_validator, model_validator


from pydantic import BaseModel, Field


# ── Employee ──────────────────────────────────────────────────────────────────

class Employee(BaseModel):
    """
    Master record for an employee.
    'id'          → numeric DB primary key (used as FK in reviews)
    'employee_id' → displayed business code (e.g. EMP101)
    """
    id: int = Field(..., ge=1, description="Primary key: employees.id")
    employee_id: str = Field(..., max_length=20, description="Unique business code e.g. EMP101")
    name: str = Field(..., max_length=100)
    department: Optional[str] = Field(None, max_length=100)
    email: Optional[EmailStr] = Field(None)
    status: Literal["Active", "Inactive"] = Field(default="Active")

    model_config = {"from_attributes": True}


# ── Review Period ─────────────────────────────────────────────────────────────

class ReviewPeriod(BaseModel):
    """
    A configured review cycle (annual or half-yearly).
    Only periods with status='Open' accept new review submissions.
    """
    id: int = Field(..., ge=1, description="Primary key: review_periods.id")
    name: str = Field(..., max_length=50, description="e.g. H1 2026 (Jan–Jun)")
    start_date: date
    end_date: date
    status: Literal["Open", "Closed"] = Field(default="Open")

    model_config = {"from_attributes": True}

    @model_validator(mode="after")
    def end_must_be_after_start(self) -> "ReviewPeriod":
        if self.end_date <= self.start_date:
            raise ValueError("end_date must be after start_date")
        return self


# ── Review Create (Request Body for POST /reviews) ────────────────────────────

class ReviewCreate(BaseModel):
    """
    Payload sent by the client to submit a new performance review.

    Rules:
    - employee_id → numeric FK to employees.id (NOT the EMP101 code)
    - period_id   → numeric FK to review_periods.id
    - Ratings     → integer 1–5 (validated)
    - comments    → required, non-whitespace
    - average_rating is NOT sent — server calculates it
    """
    employee_id: int = Field(
        ..., ge=1,
        description="FK to employees.id (numeric DB key, not the EMP101 code)"
    )
    period_id: int = Field(
        ..., ge=1,
        description="FK to review_periods.id"
    )
    quality_rating: int = Field(
        ..., ge=1, le=5,
        description="Quality of Work rating (1–5)"
    )
    delivery_rating: int = Field(
        ..., ge=1, le=5,
        description="Delivery & Ownership rating (1–5)"
    )
    teamwork_rating: int = Field(
        ..., ge=1, le=5,
        description="Teamwork & Collaboration rating (1–5)"
    )
    comments: str = Field(
        ..., min_length=1,
        description="Manager feedback — required, non-blank"
    )

    @field_validator("comments")
    @classmethod
    def comments_must_not_be_whitespace(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("comments must not be blank or whitespace only")
        return v

    model_config = {"extra": "forbid"}   # Reject unknown fields (matches OpenAPI additionalProperties: false)


# ── Review (Full Response from GET /reviews & POST /reviews) ──────────────────

class Review(BaseModel):
    """
    Stored performance review — enriched with employee/period labels.
    Returned by:
      GET  /reviews          (list)
      GET  /reviews/{id}     (detail)
      POST /reviews          (201 Created)

    Notes:
    - average_rating is server-calculated: ROUND((quality + delivery + teamwork) / 3, 2)
    - status is always "Completed" (derived, not stored as a DB column)
    - employee_code, employee_name, period_name, created_at are read-only
    """
    id: int = Field(..., ge=1, description="Primary key: performance_reviews.id")
    employee_id: int = Field(..., ge=1, description="FK to employees.id")
    employee_code: str = Field(..., description="Displayed code e.g. EMP101")
    employee_name: str = Field(..., description="Employee full name")
    period_id: int = Field(..., ge=1, description="FK to review_periods.id")
    period_name: str = Field(..., description="e.g. H1 2026 (Jan–Jun)")
    quality_rating: int = Field(..., ge=1, le=5)
    delivery_rating: int = Field(..., ge=1, le=5)
    teamwork_rating: int = Field(..., ge=1, le=5)
    average_rating: float = Field(
        ..., ge=1.0, le=5.0,
        description="Server-calculated: ROUND((quality + delivery + teamwork) / 3, 2)"
    )
    comments: str = Field(..., min_length=1)
    status: Literal["Completed"] = Field(
        default="Completed",
        description="Derived display-only label; not a stored DB column"
    )
    created_at: datetime = Field(..., description="Review submission timestamp")

    model_config = {"from_attributes": True}


# ── Error Response ────────────────────────────────────────────────────────────

class ErrorResponse(BaseModel):
    """Standard error envelope returned on 400 / 404 / 409 / 500."""
    code: str = Field(..., description="Machine-readable error code e.g. DUPLICATE_REVIEW")
    message: str = Field(..., description="Human-readable error description")


# ── Validation Issue (FastAPI 422 detail item) ────────────────────────────────

class ValidationIssue(BaseModel):
    """Single item inside the 'detail' list of a 422 Unprocessable Entity response."""
    loc: list[str | int] = Field(..., description="Location of the failing field e.g. ['body', 'quality_rating']")
    msg: str = Field(..., description="Validation error message")
    type: str = Field(..., description="Error type key e.g. 'less_than_equal'")


class HTTPValidationError(BaseModel):
    """422 response body wrapping one or more ValidationIssues."""
    detail: list[ValidationIssue]
