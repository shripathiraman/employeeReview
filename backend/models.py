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


class Employee(BaseModel):
    employee_id: str
    name: str
    department: str | None = None
    email: str | None = None
    status: str = "Active"


class ReviewCreate(BaseModel):
    employee_id: int  # References employees.id
    period_id: int
    quality_rating: int = Field(ge=1, le=5)
    delivery_rating: int = Field(ge=1, le=5)
    teamwork_rating: int = Field(ge=1, le=5)
    comments: str | None = None


