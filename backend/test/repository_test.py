"""Integration tests for the repository database operations."""

import os
import sys
import unittest
from pathlib import Path

from dotenv import load_dotenv
from fastapi import HTTPException

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

import repository


load_dotenv(Path(__file__).resolve().parents[1] / ".env")


class RepositoryIntegrationTests(unittest.TestCase):
    """Run read-only repository checks against the configured database."""

    @classmethod
    def setUpClass(cls) -> None:
        if not os.getenv("DATABASE_URL"):
            raise unittest.SkipTest("DATABASE_URL is not configured")

    def test_list_employees(self) -> None:
        employees = repository.list_employees()

        self.assertIsInstance(employees, list)
        if employees:
            self.assertIn("id", employees[0])
            self.assertIn("employee_id", employees[0])

    def test_list_review_periods(self) -> None:
        periods = repository.list_review_periods()

        self.assertIsInstance(periods, list)
        if periods:
            self.assertIn("id", periods[0])
            self.assertIn("name", periods[0])

    def test_list_reviews_accepts_optional_filters(self) -> None:
        reviews = repository.list_reviews()

        self.assertIsInstance(reviews, list)
        if reviews:
            self.assertIn("id", reviews[0])
            self.assertIn("average_rating", reviews[0])

    def test_get_review_returns_none_for_unknown_id(self) -> None:
        review = repository.get_review(-1)

        self.assertIsNone(review)

    def test_repository_errors_are_http_exceptions(self) -> None:
        original_url = os.environ.pop("DATABASE_URL", None)
        try:
            with self.assertRaises(HTTPException) as raised:
                repository.list_employees()
            self.assertEqual(raised.exception.status_code, 503)
        finally:
            if original_url is not None:
                os.environ["DATABASE_URL"] = original_url


if __name__ == "__main__":
    unittest.main()
