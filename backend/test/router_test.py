"""Unit tests for API routing, validation, and response behavior."""

import sys
import unittest
from pathlib import Path
from unittest.mock import patch

from fastapi import FastAPI, HTTPException
from fastapi.testclient import TestClient

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

import router


app = FastAPI()
app.include_router(router.router)


class RouterUnitTests(unittest.TestCase):
    """Test API endpoints without accessing the database."""

    EMPLOYEE = {
        "id": 1,
        "employee_id": "E001",
        "name": "Ada Lovelace",
        "department": "Engineering",
        "email": "ada@example.com",
        "status": "Active",
    }
    REVIEW_PERIOD = {
        "id": 2,
        "name": "2025 Annual Review",
        "start_date": "2025-01-01",
        "end_date": "2025-12-31",
        "status": "Open",
    }
    REVIEW = {
        "id": 3,
        "employee_id": 1,
        "employee_name": "Ada Lovelace",
        "period_id": 2,
        "period_name": "2025 Annual Review",
        "quality_rating": 4,
        "delivery_rating": 5,
        "teamwork_rating": 4,
        "average_rating": 4.33,
        "comments": "Strong collaboration",
        "created_at": "2025-12-01T12:00:00",
    }
    REVIEW_REQUEST = {
        "employee_id": 1,
        "period_id": 2,
        "quality_rating": 4,
        "delivery_rating": 5,
        "teamwork_rating": 4,
        "comments": "Strong collaboration",
    }

    def setUp(self) -> None:
        """Prepare a client for the API router.
        Scenario: create an isolated in-process FastAPI test client.
        """
        self.client = TestClient(app)

    def test_health_check_returns_status_and_message(self) -> None:
        """Tests router.health_check.
        Scenario: returns the healthy status and expected API message.
        """
        response = self.client.get("/api/health")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.json(),
            {
                "status": "ok",
                "message": "Employee Review Application API is up and running",
            },
        )

    def test_read_employees_returns_employee_list(self) -> None:
        """Tests router.read_employees.
        Scenario: returns service results as employee response objects.
        """
        with patch.object(router.services, "get_employees", return_value=[self.EMPLOYEE]):
            response = self.client.get("/api/employees")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), [self.EMPLOYEE])

    def test_read_employees_returns_empty_list(self) -> None:
        """Tests router.read_employees.
        Scenario: returns an empty list when no employees exist.
        """
        with patch.object(router.services, "get_employees", return_value=[]):
            response = self.client.get("/api/employees")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), [])

    def test_read_employees_returns_service_http_error(self) -> None:
        """Tests router.read_employees.
        Scenario: exposes an employee-service HTTP error in the API response.
        """
        error = HTTPException(status_code=503, detail="Database service is unavailable.")
        with patch.object(router.services, "get_employees", side_effect=error):
            response = self.client.get("/api/employees")

        self.assertEqual(response.status_code, 503)
        self.assertEqual(response.json(), {"detail": "Database service is unavailable."})

    def test_read_review_periods_returns_period_list(self) -> None:
        """Tests router.read_review_periods.
        Scenario: returns service results as review-period response objects.
        """
        with patch.object(
            router.services, "get_review_periods", return_value=[self.REVIEW_PERIOD]
        ):
            response = self.client.get("/api/review-periods")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), [self.REVIEW_PERIOD])

    def test_read_review_periods_returns_service_http_error(self) -> None:
        """Tests router.read_review_periods.
        Scenario: exposes a review-period service HTTP error to the client.
        """
        error = HTTPException(status_code=503, detail="Database service is unavailable.")
        with patch.object(router.services, "get_review_periods", side_effect=error):
            response = self.client.get("/api/review-periods")

        self.assertEqual(response.status_code, 503)
        self.assertEqual(response.json(), {"detail": "Database service is unavailable."})

    def test_read_reviews_uses_default_query_values(self) -> None:
        """Tests router.read_reviews.
        Scenario: applies default pagination and optional filters.
        """
        with patch.object(router.services, "get_reviews", return_value=[]) as get_reviews:
            response = self.client.get("/api/reviews")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), [])
        get_reviews.assert_called_once_with(
            employee_id=None, period_id=None, limit=100, offset=0
        )

    def test_read_reviews_passes_filters_and_boundary_pagination(self) -> None:
        """Tests router.read_reviews.
        Scenario: forwards filters and inclusive pagination boundary values.
        """
        with patch.object(router.services, "get_reviews", return_value=[]) as get_reviews:
            response = self.client.get(
                "/api/reviews?employee_id=1&period_id=2&limit=500&offset=0"
            )

        self.assertEqual(response.status_code, 200)
        get_reviews.assert_called_once_with(
            employee_id=1, period_id=2, limit=500, offset=0
        )

    def test_read_reviews_rejects_invalid_query_boundaries(self) -> None:
        """Tests router.read_reviews.
        Scenario: rejects nonpositive IDs, invalid limits, and negative offsets.
        """
        invalid_queries = (
            "employee_id=0",
            "period_id=0",
            "limit=0",
            "limit=501",
            "offset=-1",
        )
        with patch.object(router.services, "get_reviews", return_value=[]) as get_reviews:
            for query in invalid_queries:
                with self.subTest(query=query):
                    response = self.client.get(f"/api/reviews?{query}")
                    self.assertEqual(response.status_code, 422)

        get_reviews.assert_not_called()

    def test_read_reviews_returns_service_http_error(self) -> None:
        """Tests router.read_reviews.
        Scenario: returns service HTTP errors using FastAPI's error format.
        """
        error = HTTPException(status_code=503, detail="Review service is unavailable.")
        with patch.object(router.services, "get_reviews", side_effect=error):
            response = self.client.get("/api/reviews")

        self.assertEqual(response.status_code, 503)
        self.assertEqual(response.json(), {"detail": "Review service is unavailable."})

    def test_read_review_returns_requested_review(self) -> None:
        """Tests router.read_review.
        Scenario: forwards the path ID and returns the matching review.
        """
        with patch.object(router.services, "get_review", return_value=self.REVIEW) as get_review:
            response = self.client.get("/api/reviews/3")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), self.REVIEW)
        get_review.assert_called_once_with(3)

    def test_read_review_returns_service_http_error(self) -> None:
        """Tests router.read_review.
        Scenario: returns not-found and service errors with their status and detail.
        """
        errors = (
            HTTPException(status_code=404, detail="Review not found"),
            HTTPException(status_code=503, detail="Database service is unavailable."),
        )
        with patch.object(router.services, "get_review", side_effect=errors):
            for expected_status in (404, 503):
                with self.subTest(status=expected_status):
                    response = self.client.get("/api/reviews/3")
                    self.assertEqual(response.status_code, expected_status)
                    self.assertEqual(response.json(), {"detail": errors[0 if expected_status == 404 else 1].detail})

    def test_read_review_rejects_noninteger_id(self) -> None:
        """Tests router.read_review.
        Scenario: rejects a path ID that cannot be parsed as an integer.
        """
        with patch.object(router.services, "get_review") as get_review:
            response = self.client.get("/api/reviews/not-an-id")

        self.assertEqual(response.status_code, 422)
        get_review.assert_not_called()

    def test_create_review_returns_created_review(self) -> None:
        """Tests router.create_review.
        Scenario: forwards valid review data and returns HTTP 201 with the review.
        """
        with patch.object(
            router.services, "submit_review", return_value=self.REVIEW
        ) as submit_review:
            response = self.client.post("/api/reviews", json=self.REVIEW_REQUEST)

        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.json(), self.REVIEW)
        submit_review.assert_called_once_with(self.REVIEW_REQUEST)

    def test_create_review_accepts_rating_boundaries_without_comments(self) -> None:
        """Tests router.create_review.
        Scenario: accepts ratings 1 and 5 when optional comments are omitted.
        """
        request_data = {
            "employee_id": 1,
            "period_id": 2,
            "quality_rating": 1,
            "delivery_rating": 5,
            "teamwork_rating": 1,
        }
        with patch.object(
            router.services, "submit_review", return_value=self.REVIEW
        ) as submit_review:
            response = self.client.post("/api/reviews", json=request_data)

        self.assertEqual(response.status_code, 201)
        submit_review.assert_called_once_with({**request_data, "comments": None})

    def test_create_review_rejects_invalid_request_data(self) -> None:
        """Tests router.create_review.
        Scenario: rejects missing fields, invalid IDs, and ratings outside 1 to 5.
        """
        invalid_requests = (
            {key: value for key, value in self.REVIEW_REQUEST.items() if key != "period_id"},
            {**self.REVIEW_REQUEST, "employee_id": 0},
            {**self.REVIEW_REQUEST, "period_id": 0},
            {**self.REVIEW_REQUEST, "quality_rating": 0},
            {**self.REVIEW_REQUEST, "delivery_rating": 6},
            {**self.REVIEW_REQUEST, "teamwork_rating": "invalid"},
        )
        with patch.object(router.services, "submit_review") as submit_review:
            for request_data in invalid_requests:
                with self.subTest(request_data=request_data):
                    response = self.client.post("/api/reviews", json=request_data)
                    self.assertEqual(response.status_code, 422)

        submit_review.assert_not_called()

    def test_create_review_returns_service_http_errors(self) -> None:
        """Tests router.create_review.
        Scenario: preserves service error status codes and meaningful details.
        """
        errors = (
            HTTPException(status_code=404, detail="Employee or review period was not found"),
            HTTPException(status_code=409, detail="This employee already has a review for that period"),
            HTTPException(status_code=422, detail="Reviews can only be submitted for open review periods"),
            HTTPException(status_code=503, detail="Database service is unavailable."),
        )
        with patch.object(router.services, "submit_review", side_effect=errors):
            for error in errors:
                with self.subTest(status=error.status_code):
                    response = self.client.post("/api/reviews", json=self.REVIEW_REQUEST)
                    self.assertEqual(response.status_code, error.status_code)
                    self.assertEqual(response.json(), {"detail": error.detail})


if __name__ == "__main__":
    unittest.main()
