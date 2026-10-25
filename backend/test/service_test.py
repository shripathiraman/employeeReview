"""Unit tests for service-layer behavior and HTTP error mapping."""

import sys
import unittest
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import patch

import psycopg
from fastapi import HTTPException

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

import services


class FakeRaiseException(Exception):
    """Database exception used to test PostgreSQL raise handling."""

    def __init__(self) -> None:
        self.diag = SimpleNamespace(message_primary="Review period is closed")


class ServiceUnitTests(unittest.TestCase):
    """Test successful service operations and translated failures."""

    def assert_http_error(self, function, status_code: int, detail: str) -> None:
        """Assert that a service call raises the expected HTTP error."""
        with self.assertRaises(HTTPException) as raised:
            function()
        self.assertEqual(raised.exception.status_code, status_code)
        self.assertEqual(raised.exception.detail, detail)

    def test_calculate_average_rating(self) -> None:
        """Service method: service.calculate_average_rating.
        Scenario: averages three ratings and rounds to two decimals.
        """
        result = services.calculate_average_rating(
            {"quality_rating": 4, "delivery_rating": 5, "teamwork_rating": 4}
        )

        self.assertEqual(result, 4.33)

    @patch("services.repository.list_employees", return_value=[{"id": 1}])
    def test_get_employees(self, list_employees) -> None:
        """Service method: service.get_employees.
        Scenario: returns the employee list from the repository.
        """
        self.assertEqual(services.get_employees(), [{"id": 1}])
        list_employees.assert_called_once_with()

    @patch("services.repository.list_employees", side_effect=RuntimeError("database down"))
    def test_get_employees_database_error(self, _list_employees) -> None:
        """Service method: service.get_employees.
        Scenario: maps a repository failure to HTTP 503.
        """
        self.assert_http_error(services.get_employees, 503, "database down")

    @patch("services.repository.list_review_periods", return_value=[{"id": 2}])
    def test_get_review_periods(self, list_review_periods) -> None:
        """Service method: service.get_review_periods.
        Scenario: returns review periods from the repository.
        """
        self.assertEqual(services.get_review_periods(), [{"id": 2}])
        list_review_periods.assert_called_once_with()

    @patch("services.repository.list_review_periods", side_effect=RuntimeError("database down"))
    def test_get_review_periods_database_error(self, _list_review_periods) -> None:
        """Service method: service.get_review_periods.
        Scenario: maps a repository failure to HTTP 503.
        """
        self.assert_http_error(services.get_review_periods, 503, "database down")

    @patch("services.repository.list_reviews", return_value=[{"id": 3}])
    def test_get_reviews(self, list_reviews) -> None:
        """Service method: service.get_reviews.
        Scenario: forwards filters and pagination and returns reviews.
        """
        result = services.get_reviews(employee_id=None, period_id=None, limit=10, offset=0)

        self.assertEqual(result, [{"id": 3}])
        list_reviews.assert_called_once_with(
            employee_id=None, period_id=None, limit=10, offset=0
        )

    @patch("services.repository.list_reviews", side_effect=RuntimeError("database down"))
    def test_get_reviews_database_error(self, _list_reviews) -> None:
        """Service method: service.get_reviews.
        Scenario: maps a repository failure to HTTP 503.
        """
        self.assert_http_error(
            lambda: services.get_reviews(
                employee_id=None, period_id=None, limit=10, offset=0
            ),
            503,
            "database down",
        )

    @patch("services.repository.get_review", return_value={"id": 4})
    def test_get_review(self, get_review) -> None:
        """Service method: service.get_review.
        Scenario: returns the review matching the supplied ID.
        """
        self.assertEqual(services.get_review(4), {"id": 4})
        get_review.assert_called_once_with(4)

    @patch("services.repository.get_review", return_value=None)
    def test_get_review_not_found(self, _get_review) -> None:
        """Service method: service.get_review.
        Scenario: raises HTTP 404 when the requested review is absent.
        """
        self.assert_http_error(lambda: services.get_review(4), 404, "Review not found")

    @patch("services.repository.get_review", side_effect=RuntimeError("database down"))
    def test_get_review_database_error(self, _get_review) -> None:
        """Service method: service.get_review.
        Scenario: maps a repository failure for the requested ID to HTTP 503.
        """
        self.assert_http_error(lambda: services.get_review(4), 503, "database down")

    @patch("services.repository.create_review", return_value={"id": 5})
    def test_submit_review_calculates_average(self, create_review) -> None:
        """Service method: service.submit_review.
        Scenario: calculates the average rating before creating a review.
        """
        review_data = {
            "employee_id": 1,
            "period_id": 2,
            "quality_rating": 4,
            "delivery_rating": 5,
            "teamwork_rating": 4,
        }

        self.assertEqual(services.submit_review(review_data), {"id": 5})
        create_review.assert_called_once_with({**review_data, "average_rating": 4.33})

    @patch(
        "services.repository.create_review",
        side_effect=psycopg.errors.ForeignKeyViolation("missing reference"),
    )
    def test_submit_review_foreign_key_error(self, _create_review) -> None:
        """Service method: service.submit_review.
        Scenario: maps a foreign-key failure to HTTP 404.
        """
        self.assert_http_error(
            lambda: services.submit_review(self._review_data()),
            404,
            "Employee or review period was not found",
        )

    @patch(
        "services.repository.create_review",
        side_effect=psycopg.errors.UniqueViolation("duplicate review"),
    )
    def test_submit_review_duplicate_error(self, _create_review) -> None:
        """Service method: service.submit_review.
        Scenario: maps a duplicate review failure to HTTP 409.
        """
        self.assert_http_error(
            lambda: services.submit_review(self._review_data()),
            409,
            "This employee already has a review for that period",
        )

    @patch("services.psycopg.errors.RaiseException", FakeRaiseException)
    @patch("services.repository.create_review", side_effect=FakeRaiseException())
    def test_submit_review_database_validation_error(self, _create_review) -> None:
        """Service method: service.submit_review.
        Scenario: maps a closed review period database error to HTTP 422.
        """
        self.assert_http_error(
            lambda: services.submit_review(self._review_data()),
            422,
            "Review period is closed",
        )

    @patch("services.repository.create_review", side_effect=RuntimeError("database down"))
    def test_submit_review_database_error(self, _create_review) -> None:
        """Service method: service.submit_review.
        Scenario: maps a repository failure to HTTP 503.
        """
        self.assert_http_error(
            lambda: services.submit_review(self._review_data()),
            503,
            "database down",
        )

    @staticmethod
    def _review_data() -> dict:
        """Return valid input shared by submit-review tests."""
        return {
            "employee_id": 1,
            "period_id": 2,
            "quality_rating": 4,
            "delivery_rating": 5,
            "teamwork_rating": 4,
        }


if __name__ == "__main__":
    unittest.main()
