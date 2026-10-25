from fastapi import FastAPI

from router import router

app = FastAPI(
    title="Employee Performance Review API",
    description="API for employees, review periods, and performance reviews.",
    version="1.0.0",
)

app.include_router(router)
