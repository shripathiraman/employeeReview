from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field


class EmployeeResponse(BaseModel):
    """Response model containing employee details.
    """

    model_config = ConfigDict(from_attributes=True)

    id: int
    employee_id: str
    name: str
    department: str | None = None
    email: str | None = None
    status: str


class ReviewPeriodResponse(BaseModel):
    """Response model containing review-period details.
    """

    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    start_date: date
    end_date: date
    status: str


class ReviewCreate(BaseModel):
    """Request model used when creating a performance review.
    """

    employee_id: int = Field(gt=0, description="Value of employees.id")
    period_id: int = Field(gt=0, description="Value of review_periods.id")
    quality_rating: int = Field(ge=1, le=5)
    delivery_rating: int = Field(ge=1, le=5)
    teamwork_rating: int = Field(ge=1, le=5)
    comments: str | None = None


class ReviewResponse(BaseModel):
    """Response model containing a submitted performance review.
    """

    id: int
    employee_id: int
    employee_name: str
    period_id: int
    period_name: str
    quality_rating: int
    delivery_rating: int
    teamwork_rating: int
    average_rating: float
    comments: str | None = None
    created_at: datetime
