"""Unit tests for repository database operations."""

import sys
import unittest
from pathlib import Path
from unittest.mock import patch

import psycopg
from fastapi import HTTPException

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

import repository


class RepositoryUnitTests(unittest.TestCase):
    """Verify repository queries and database error translation without PostgreSQL."""

    def mocked_connection(self):
        connect = patch("repository._connect")
        mock_connect = connect.start()
        self.addCleanup(connect.stop)
        connection = mock_connect.return_value.__enter__.return_value
        cursor = connection.cursor.return_value.__enter__.return_value
        return mock_connect, cursor

    def test_list_employees_returns_rows(self) -> None:
        connect, cursor = self.mocked_connection()
        rows = [{"id": 1, "employee_id": "E001"}]
        cursor.fetchall.return_value = rows

        self.assertEqual(repository.list_employees(), rows)
        cursor.execute.assert_called_once()
        connect.assert_called_once_with()

    def test_list_review_periods_returns_rows(self) -> None:
        _, cursor = self.mocked_connection()
        rows = [{"id": 2, "name": "2025 Annual Review"}]
        cursor.fetchall.return_value = rows

        self.assertEqual(repository.list_review_periods(), rows)
        cursor.execute.assert_called_once()

    def test_list_reviews_builds_filters_and_pagination(self) -> None:
        _, cursor = self.mocked_connection()
        cursor.fetchall.return_value = [{"id": 3}]

        result = repository.list_reviews(employee_id=1, period_id=2, limit=10, offset=5)

        self.assertEqual(result, [{"id": 3}])
        query, values = cursor.execute.call_args.args
        self.assertIn("pr.employee_id = %s", query)
        self.assertIn("pr.period_id = %s", query)
        self.assertEqual(values, [1, 2, 10, 5])

    def test_get_review_returns_row_or_none(self) -> None:
        _, cursor = self.mocked_connection()
        cursor.fetchone.return_value = {"id": 4}

        self.assertEqual(repository.get_review(4), {"id": 4})
        cursor.execute.assert_called_once()

        cursor.fetchone.return_value = None
        self.assertIsNone(repository.get_review(99))

    def test_create_review_inserts_and_reads_created_review(self) -> None:
        _, cursor = self.mocked_connection()
        cursor.fetchone.side_effect = [{"id": 5}, {"id": 5, "average_rating": 4.33}]
        review = {
            "employee_id": 1,
            "period_id": 2,
            "quality_rating": 4,
            "delivery_rating": 5,
            "teamwork_rating": 4,
            "average_rating": 4.33,
            "comments": "Good work",
        }

        result = repository.create_review(review)

        self.assertEqual(result, {"id": 5, "average_rating": 4.33})
        self.assertEqual(cursor.execute.call_count, 2)
        insert_values = cursor.execute.call_args_list[0].args[1]
        self.assertEqual(insert_values[-2:], (4.33, "Good work"))

    def test_database_errors_are_translated(self) -> None:
        with patch("repository._connect", side_effect=psycopg.OperationalError("offline")):
            with self.assertRaises(HTTPException) as raised:
                repository.list_employees()

        self.assertEqual(raised.exception.status_code, 500)
        self.assertEqual(raised.exception.detail, "Unable to retrieve employees.")


if __name__ == "__main__":
    unittest.main()
