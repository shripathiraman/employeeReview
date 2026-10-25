import psycopg2
import os
from dotenv import load_dotenv

#load_dotenv() loads environment variables from a .env file into your Python application's environment.
load_dotenv()   


def get_database_connection():
    #Reads the database connection string
    DATABASE_URL = os.getenv("DATABASE_URL")
    return psycopg2.connect(DATABASE_URL)
