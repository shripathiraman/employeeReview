from pydantic import ValidationError as PydanticValidationError

from models import Employee, ReviewCreate, ReviewPeriod
from repository import (
    get_all_reviews,
    get_employees,
    get_review_by_id,
    get_review_periods,
    submit_review as save_review,
)


class ServiceError(Exception):
    pass


class NotFoundError(ServiceError):
    pass


class ValidationError(ServiceError):
    pass


class ConflictError(ServiceError):
    pass


def _calculate_average(quality, delivery, teamwork):
    return round((quality + delivery + teamwork) / 3, 2)


def _find_by_id(items, item_id):
    for item in items:
        if item.id == item_id:
            return item
    return None


def list_employees():
    return [Employee.model_validate(row) for row in get_employees()]


def list_review_periods():
    return [ReviewPeriod.model_validate(row) for row in get_review_periods()]


def list_reviews(employee_id=None, period_id=None):
    return get_all_reviews(employee_id=employee_id, period_id=period_id)


def get_review_details(review_id):
    return get_review_by_id(review_id)


def submit_review(data):
    try:
        review = ReviewCreate.model_validate(data)
    except PydanticValidationError as e:
        raise ValidationError(str(e)) from e

    if _find_by_id(list_employees(), review.employee_id) is None:
        raise NotFoundError(f"Employee {review.employee_id} not found")

    period = _find_by_id(list_review_periods(), review.period_id)
    if period is None:
        raise NotFoundError(f"Review period {review.period_id} not found")
    if period.status != "Open":
        raise ValidationError(f"Review period {period.name} is not open for reviews")

    return save_review(
        {
            "employee_id": review.employee_id,
            "period_id": review.period_id,
            "quality_rating": review.quality_rating,
            "delivery_rating": review.delivery_rating,
            "teamwork_rating": review.teamwork_rating,
            "average_rating": _calculate_average(
                review.quality_rating, review.delivery_rating, review.teamwork_rating
            ),
            "comments": review.comments.strip(),
        }
    )
