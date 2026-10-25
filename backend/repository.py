
from http.client import HTTPException
from select import select
from tkinter import INSERT
from fastapi import HTTPException, Query
from database import get_database_connection


def get_employees():
    """
    Fetch all employees from the database.

    Returns:
        list: A list of dictionaries representing employees.
    """
    try:
        from database import get_database_connection
        with get_database_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT * FROM employees;")
                rows = cur.fetchall()
                columns = [desc[0] for desc in cur.description]
                employees = [dict(zip(columns, row)) for row in rows]
                return employees
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


def get_review_periods():
    """
    Fetch all review periods from the database.

    Returns:
        list: A list of dictionaries representing review periods.
    """
    try:
        from database import get_database_connection
        with get_database_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT * FROM review_periods;")
                rows = cur.fetchall()
                columns = [desc[0] for desc in cur.description]
                review_periods = [dict(zip(columns, row)) for row in rows]
                return review_periods
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def get_reviews(review_data: dict):
    """
    Fetch performance reviews based on employee_id, period_id, quality_rating, delivery_rating, and teamwork_rating from the database.
    """
    try:
        from database import get_database_connection
        with get_database_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT * FROM performance_reviews WHERE employee_id = %s AND period_id = %s AND quality_rating = %s AND delivery_rating = %s AND teamwork_rating = %s;", (review_data["employee_id"], review_data["period_id"], review_data["quality_rating"], review_data["delivery_rating"], review_data["teamwork_rating"]))
                rows = cur.fetchall()
                columns = [desc[0] for desc in cur.description]
                reviews = [dict(zip(columns, row)) for row in rows]
                return reviews
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def get_review_by_id(review_id: int):
    """
    Fetch a specific review by its ID from the database.

    Args:
        review_id (int): The ID of the review to fetch."""
    try:
        from database import get_database_connection
        with get_database_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT * FROM performance_reviews WHERE period_id = %s;", (review_id,))
                row = cur.fetchone()
                if row is None:
                    raise ValueError(f"Review with ID {review_id} not found.")
                columns = [desc[0] for desc in cur.description]
                review = dict(zip(columns, row))
                return review
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def submit_review(review_data: dict):
    """
    Submit a new performance review to the database.

    Args:
        review_data (dict): A dictionary containing the review data.
    """
    try:
        from database import get_database_connection
        with get_database_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    INSERT INTO performance_reviews (employee_id, period_id, quality_rating, delivery_rating, teamwork_rating, average_rating, comments)
                    VALUES (%s, %s, %s, %s, %s, %s, %s);
                    """,
                    (
                        review_data["employee_id"],
                        review_data["period_id"],
                        review_data["quality_rating"],
                        review_data["delivery_rating"],
                        review_data["teamwork_rating"],
                        review_data["average_rating"],
                        review_data["comments"]
                    )
                )
                conn.commit()
                return {"message": "Review submitted successfully."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
