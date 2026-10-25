from repository import (
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


RATING_FIELDS = ("quality_rating", "delivery_rating", "teamwork_rating")


def _validate_rating(name, value):
    if not isinstance(value, int) or isinstance(value, bool):
        raise ValidationError(f"{name} must be an integer")
    if value < 1 or value > 5:
        raise ValidationError(f"{name} must be between 1 and 5")


def _calculate_average(quality, delivery, teamwork):
    return round((quality + delivery + teamwork) / 3, 2)


def _find_by_id(rows, row_id):
    for row in rows:
        if row["id"] == row_id:
            return row
    return None


def list_employees():
    return get_employees()


def list_review_periods():
    return get_review_periods()


def get_review_details(review_id):
    return get_review_by_id(review_id)


def submit_review(data):
    employee_id = data.get("employee_id")
    period_id = data.get("period_id")
    comments = data.get("comments")

    if _find_by_id(get_employees(), employee_id) is None:
        raise NotFoundError(f"Employee {employee_id} not found")

    period = _find_by_id(get_review_periods(), period_id)
    if period is None:
        raise NotFoundError(f"Review period {period_id} not found")
    if period["status"] != "Open":
        raise ValidationError(f"Review period {period['name']} is not open for reviews")

    for field in RATING_FIELDS:
        _validate_rating(field, data.get(field))

    if not comments or not str(comments).strip():
        raise ValidationError("comments is required")

    quality = data["quality_rating"]
    delivery = data["delivery_rating"]
    teamwork = data["teamwork_rating"]

    return save_review(
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
