

from fastapi import FastAPI

from router import router

app = FastAPI(
    title="Employee Performance Review Management System",
    description="API for managing employee performance reviews.",
    version="1.0.0",
)

app.include_router(router, prefix="/api")


@app.get("/", tags=["Health"])
def root():
    return {
        "message": "Employee Performance Review API",
        "docs": "/docs",
    }
