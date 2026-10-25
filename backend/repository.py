from fastapi import HTTPException
from database import get_database_connection



def get_employees():
    """
    Fetch all employees from the database.

    Returns:
        list: A list of dictionaries representing employees.
    """
    try:
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

def get_reviews(employee_id: int | None = None, period_id: int | None = None):
    """Fetch enriched performance reviews, optionally filtered by employee/period."""
    try:
        from database import get_database_connection
        with get_database_connection() as conn:
            with conn.cursor() as cur:
                query = """
                    SELECT
                        r.id, r.employee_id, e.employee_id AS employee_code,
                        e.name AS employee_name, r.period_id, p.name AS period_name,
                        r.quality_rating, r.delivery_rating, r.teamwork_rating,
                        r.average_rating, r.comments, r.created_at
                    FROM performance_reviews AS r
                    JOIN employees AS e ON e.id = r.employee_id
                    JOIN review_periods AS p ON p.id = r.period_id
                """
                filters = []
                values = []
                if employee_id is not None:
                    filters.append("r.employee_id = %s")
                    values.append(employee_id)
                if period_id is not None:
                    filters.append("r.period_id = %s")
                    values.append(period_id)
                if filters:
                    query += " WHERE " + " AND ".join(filters)
                query += " ORDER BY r.created_at DESC, r.id DESC;"
                cur.execute(query, values)
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
                cur.execute(
                    """
                    SELECT
                        r.id, r.employee_id, e.employee_id AS employee_code,
                        e.name AS employee_name, r.period_id, p.name AS period_name,
                        r.quality_rating, r.delivery_rating, r.teamwork_rating,
                        r.average_rating, r.comments, r.created_at
                    FROM performance_reviews AS r
                    JOIN employees AS e ON e.id = r.employee_id
                    JOIN review_periods AS p ON p.id = r.period_id
                    WHERE r.id = %s;
                    """,
                    (review_id,),
                )
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
