import psycopg2
import os
from dotenv import load_dotenv

#load_dotenv() loads environment variables from a .env file into your Python application's environment.
load_dotenv()   


def get_database_connection():
    #Reads the database connection string
    DATABASE_URL = os.getenv("DATABASE_URL")
    return psycopg2.connect(DATABASE_URL)


def test_database_connection() -> bool:
    """Check whether the configured database is reachable.

    Returns:
        bool: ``True`` when the database responds to a simple query;
            otherwise ``False``.
    """
    connection = None
    try:
        connection = get_database_connection()
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1;")
            is_connected = cursor.fetchone()[0] == 1
            if is_connected:
                print("DB successful connection")
            return is_connected
    except psycopg2.Error:
        return False
    finally:
        if connection is not None:
            connection.close()


if __name__ == "__main__":
    test_database_connection()
