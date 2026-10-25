from repository import (
    create_review,
    get_employee_by_id,
    get_employees,
    get_review_by_id,
    get_review_period_by_id,
    get_review_periods,
    get_reviews,
    review_exists,
)


class ServiceError(Exception):
    pass


class NotFoundError(ServiceError):
    pass


class ValidationError(ServiceError):
    pass


class ConflictError(ServiceError):
    pass


RATING_FIELDS = ("quality_rating", "delivery_rating", "teamwork_rating")


def _validate_rating(name, value):
    if not isinstance(value, int) or isinstance(value, bool):
        raise ValidationError(f"{name} must be an integer")
    if value < 1 or value > 5:
        raise ValidationError(f"{name} must be between 1 and 5")


def _calculate_average(quality, delivery, teamwork):
    return round((quality + delivery + teamwork) / 3, 2)


def list_employees():
    return get_employees()


def list_review_periods():
    return get_review_periods()


def list_reviews(employee_id=None, period_id=None):
    return get_reviews(employee_id=employee_id, period_id=period_id)


def get_review_details(review_id):
    review = get_review_by_id(review_id)
    if review is None:
        raise NotFoundError(f"Review {review_id} not found")
    return review


def submit_review(data):
    employee_id = data.get("employee_id")
    period_id = data.get("period_id")
    comments = data.get("comments")

    if get_employee_by_id(employee_id) is None:
        raise NotFoundError(f"Employee {employee_id} not found")

    period = get_review_period_by_id(period_id)
    if period is None:
        raise NotFoundError(f"Review period {period_id} not found")
    if period["status"] != "Open":
        raise ValidationError(f"Review period {period['name']} is not open for reviews")

    for field in RATING_FIELDS:
        _validate_rating(field, data.get(field))

    if not comments or not str(comments).strip():
        raise ValidationError("comments is required")

    if review_exists(employee_id, period_id):
        raise ConflictError(
            f"Employee {employee_id} already has a review for period {period_id}"
        )

    quality = data["quality_rating"]
    delivery = data["delivery_rating"]
    teamwork = data["teamwork_rating"]

    return create_review(
        {
            "employee_id": employee_id,
            "period_id": period_id,
            "quality_rating": quality,
            "delivery_rating": delivery,
            "teamwork_rating": teamwork,
            "average_rating": _calculate_average(quality, delivery, teamwork),
            "comments": str(comments).strip(),
        }
    )
