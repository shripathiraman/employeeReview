from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field, model_validator, EmailStr


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


class EmployeeUpsert(BaseModel):
    """
    Employee Model containing the submitted employee data
    """
    employee_id: str = Field(min_length=1, max_length=20)
    name: str = Field(min_length=1, max_length=100)
    department: str | None = Field(default=None, max_length=100)
    email: EmailStr | None = Field(default=None, max_length=100)
    status: str = Field(default="Active", max_length=20)


class ReviewPeriodUpsert(BaseModel):
    # Leave id out to create a new period. Include it to update an existing one.
    id: int | None = Field(default=None, gt=0)
    name: str = Field(min_length=1, max_length=50)
    start_date: date
    end_date: date
    status: str = Field(default="Open", max_length=20)

    @model_validator(mode="after")
    def check_date_order(self):
        if self.end_date < self.start_date:
            raise ValueError("end_date must be on or after start_date")
        return self