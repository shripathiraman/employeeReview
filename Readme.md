# Employee Review System

A full-stack application for managing employee records, review periods, and performance assessments. The project contains a FastAPI backend and a React + TypeScript frontend, both designed to work together to support employee review workflows in a single dashboard.

This repository brings together:
- Employee administration
- Review period tracking
- Performance review submission and retrieval
- Rating calculations and validation
- Filtering, search, and pagination for review data
- PostgreSQL-backed persistence with database-level validation rules

## Table of Contents

- [Project Overview](#project-overview)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Database Design](#database-design)
- [Backend Setup](#backend-setup)
- [Frontend Setup](#frontend-setup)
- [Running the Application](#running-the-application)
- [API Reference](#api-reference)
- [Frontend Features](#frontend-features)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)
- [Notes](#notes)

## Project Overview

The Employee Review System is built to support a performance review process where managers can:

- Create and maintain employee profiles
- Create review periods (for example, quarterly or annual cycles)
- Submit a review for an employee within an open review period
- View all submitted reviews with filters and pagination
- Inspect detailed review information and rating breakdowns

The backend serves as the source of truth and enforces business rules, including:
- Each review must reference a valid employee
- Each review must reference a valid review period
- A review can only be submitted for an open review period
- Only one review is allowed per employee within a period
- Rating values are constrained from 1 to 5

The frontend provides a dashboard-like interface for managing the workflow, using API calls to the backend.

## Architecture

The application follows a simple three-tier structure:

1. Frontend UI (React + Vite + TypeScript)
   - Renders the main navigation and views
   - Calls the API for employees, review periods, and reviews
   - Handles form validation and user interactions

2. API Layer (FastAPI)
   - Exposes REST endpoints under `/api`
   - Validates input using Pydantic models
   - Coordinates calls to the service layer and repository layer

3. Data Layer (PostgreSQL)
   - Stores employees, review periods, and performance reviews
   - Enforces integrity rules with foreign keys and PostgreSQL trigger logic

The backend is organized as:
- `main.py` – application bootstrapping and CORS configuration
- `router.py` – route declarations and HTTP handlers
- `services.py` – business logic and HTTP error translation
- `repository.py` – database access and SQL queries
- `models.py` – request/response validation models
- `database.py` – connection utility for validating DB reachability

## Technology Stack

### Backend
- Python 3.x
- FastAPI
- Pydantic
- PostgreSQL
- psycopg (database driver)
- python-dotenv
- Uvicorn (ASGI server)

### Frontend
- React 19
- TypeScript
- Vite
- Vitest
- React Testing Library
- ESLint

## Project Structure

```text
employeeReview/
├── Readme.md
├── backend/
│   ├── database.py
│   ├── main.py
│   ├── models.py
│   ├── repository.py
│   ├── requirement.txt
│   ├── router.py
│   ├── services.py
│   ├── sql/
│   │   └── sqlfiles.sql
│   └── test/
│       ├── repository_test.py
│       ├── router_test.py
│       └── service_test.py
└── frontend/
    └── employeereview/
        ├── README.md
        ├── eslint.config.js
        ├── index.html
        ├── package.json
        ├── tsconfig.app.json
        ├── tsconfig.json
        ├── tsconfig.node.json
        ├── vite.config.ts
        ├── public/
        │   ├── favicon.svg
        │   └── icons.svg
        └── src/
            ├── App.css
            ├── App.tsx
            ├── App.test.tsx
            ├── main.tsx
            ├── api/
            │   ├── client.ts
            │   ├── client.test.ts
            │   ├── resources.test.ts
            │   └── resources.ts
            ├── assets/
            │   ├── hero.png
            │   ├── react.svg
            │   └── vite.svg
            ├── compontents/
            │   ├── EmployeeForm.tsx
            │   ├── EmployeeForm.test.tsx
            │   ├── Employees.tsx
            │   ├── Employees.test.tsx
            │   ├── Navigation.tsx
            │   ├── Navigation.test.tsx
            │   ├── Pagination.tsx
            │   ├── Pagination.test.tsx
            │   ├── Ratings.tsx
            │   ├── Ratings.test.tsx
            │   ├── ReviewDetail.tsx
            │   ├── ReviewDetail.test.tsx
            │   ├── ReviewList.tsx
            │   ├── ReviewList.test.tsx
            │   ├── ReviewPeriodForm.tsx
            │   ├── ReviewPeriodForm.test.tsx
            │   ├── ReviewPeriods.tsx
            │   ├── ReviewPeriods.test.tsx
            │   ├── SubmitReview.tsx
            │   ├── SubmitReview.test.tsx
            │   └── ...
            ├── config/
            │   └── api.ts
            ├── hooks/
            │   ├── useApiResource.ts
            │   ├── useApiResource.test.ts
            │   ├── usePagination.ts
            │   ├── usePagination.test.ts
            │   ├── useResources.ts
            │   └── useResources.test.ts
            └── test/
                └── setup.ts
```

## Database Design

The database is created from `backend/sql/sqlfiles.sql` and includes three primary tables:

### 1. employees

Stores employee master data.

Columns:
- `id` – primary key
- `employee_id` – unique employee code such as `E001`
- `name` – employee name
- `department` – optional department name
- `email` – optional email address
- `status` – employee activity status, default `Active`

### 2. review_periods

Stores review periods for evaluation cycles.

Columns:
- `id` – primary key
- `name` – period name, for example `2025 Annual Review`
- `start_date` – period start
- `end_date` – period end
- `status` – period state such as `Open` or `Closed`

Validation:
- `CHECK (end_date >= start_date)`

### 3. performance_reviews

Stores submitted employee performance assessments.

Columns:
- `id` – primary key
- `employee_id` – foreign key to `employees.id`
- `period_id` – foreign key to `review_periods.id`
- `quality_rating` – integer from 1 to 5
- `delivery_rating` – integer from 1 to 5
- `teamwork_rating` – integer from 1 to 5
- `average_rating` – computed numeric value between 1 and 5
- `comments` – free-text assessment notes
- `created_at` – timestamp of creation

Constraints:
- one review per employee per review period
- numeric checks for each rating and average
- foreign keys to employee and review period records

### Trigger Rule

The SQL script also defines a PostgreSQL trigger function named `require_open_review_period()`.

It prevents inserts or updates from creating a performance record for a review period that is not currently `Open`:

```sql
CREATE FUNCTION require_open_review_period()
RETURNS TRIGGER AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM review_periods
        WHERE id = NEW.period_id
          AND status = 'Open'
    ) THEN
        RAISE EXCEPTION 'Reviews can only be submitted for open review periods';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

## Backend Setup

### 1. Create a virtual environment

From the repository root or inside `backend/`:

```bash
cd backend
python -m venv .venv
```

Activate it:

- On macOS/Linux:
```bash
source .venv/bin/activate
```

- On Windows PowerShell:
```powershell
.\.venv\Scripts\Activate.ps1
```

### 2. Install backend dependencies

```bash
pip install -r requirement.txt
```

### 3. Configure the database connection

Create a `.env` file inside `backend/`:

```env
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/employee_review
```

Update the values to match your PostgreSQL setup.

### 4. Create the PostgreSQL database

```sql
CREATE DATABASE employee_review;
```

Then run the SQL initialization script:

```bash
psql -d employee_review -f backend/sql/sqlfiles.sql
```

If you are using a different PostgreSQL client or database name, adapt the command accordingly.

### 5. Run the backend

From the `backend` folder:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at:
- `http://localhost:8000`
- Swagger UI: `http://localhost:8000/docs`
- OpenAPI JSON: `http://localhost:8000/openapi.json`

## Frontend Setup

### 1. Install dependencies

From the project root:

```bash
cd frontend/employeereview
npm install
```

### 2. Run the frontend in development mode

```bash
npm run dev
```

The Vite app usually runs on:
- `http://localhost:5173`

The frontend is configured to call the backend at:
- `http://127.0.0.1:8000/api`

## Running the Application

To run the full stack together:

1. Start PostgreSQL and ensure the `employee_review` database exists.
2. Initialize the schema using the SQL script.
3. Start the backend:
   ```bash
   cd backend
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```
4. Start the frontend:
   ```bash
   cd frontend/employeereview
   npm run dev
   ```
5. Open the frontend in the browser and use the dashboard.

## API Reference

All API routes are served under the `/api` prefix.

### Health

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Returns a basic status message to confirm the API is running |

### Employees

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/employees` | Returns all employees |
| GET | `/api/employees/{employee_id}` | Returns one employee by employee code |
| POST | `/api/employees` | Creates or updates an employee record |

Example employee payload:

```json
{
  "employee_id": "E001",
  "name": "Ada Lovelace",
  "department": "Engineering",
  "email": "ada@example.com",
  "status": "Active"
}
```

### Review Periods

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/review-periods` | Returns all review periods |
| GET | `/api/review-periods/{period_id}` | Returns one review period by ID |
| POST | `/api/review-periods` | Creates or updates a review period |

Example review period payload:

```json
{
  "id": 1,
  "name": "2025 Annual Review",
  "start_date": "2025-01-01",
  "end_date": "2025-12-31",
  "status": "Open"
}
```

### Reviews

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/reviews` | Returns reviews with optional filters and pagination |
| GET | `/api/reviews/{review_id}` | Returns one review by ID |
| POST | `/api/reviews` | Submits a new review |

Query parameters for `GET /api/reviews`:
- `employee_id` – optional employee database ID
- `period_id` – optional review period database ID
- `limit` – maximum rows returned, default `100`, min `1`, max `500`
- `offset` – pagination offset, default `0`

Example review payload:

```json
{
  "employee_id": 1,
  "period_id": 2,
  "quality_rating": 4,
  "delivery_rating": 5,
  "teamwork_rating": 4,
  "comments": "Strong collaboration and ownership throughout the period."
}
```

A review is automatically assigned an `average_rating` using:

```text
(quality_rating + delivery_rating + teamwork_rating) / 3
```

The average is rounded to 2 decimal places before persistence.

## Frontend Features

The frontend provides the following user-facing sections:

### Dashboard / Navigation
- Side navigation bar with menu items such as Dashboard, My Reviews, Submit Review, Reviews, Employees, and Review Period
- Active menu view selection

### Submit Review
- Select employee
- Select review period
- Assign ratings for:
  - Quality of Work
  - Delivery & Ownership
  - Teamwork & Collaboration
- Add overall comments
- Validate required fields and ratings before submission
- Prevent submission when a review period is closed or invalid

### Review List
- View all submitted reviews in a table
- Filter by employee and review period
- Search results using a form-based filter
- Pagination for large-result sets
- View detailed review information

### Review Detail
- Displays selected review summary
- Shows individual ratings against the three criteria
- Shows overall average rating
- Displays comments and review metadata

### Employees
- Display employees in a paginated table
- Add a new employee
- Edit an existing employee profile
- View employee details and status

### Review Periods
- Display all review periods
- Add or edit review periods
- View status such as `Open` or other configured values
- Manage period ranges and names

## Testing

### Backend tests

The backend includes unit tests under `backend/test/`.

Run:

```bash
cd backend
python -m unittest discover -s test -p "*_test.py"
```

These tests cover repository behavior, service-layer error translation, and FastAPI routing.

### Frontend tests

The frontend uses Vitest and React Testing Library.

Run:

```bash
cd frontend/employeereview
npm test
```

You can also run a production build:

```bash
npm run build
```

And linting:

```bash
npm run lint
```

## Troubleshooting

### Database connection errors

Symptoms:
- API responds with 503 or database unavailable errors
- `repository.py` cannot open a connection

Checks:
- Confirm PostgreSQL is running
- Confirm the database exists
- Confirm `DATABASE_URL` in `backend/.env` is correct
- Ensure user credentials are valid and the role has access to the database

### Frontend cannot reach the backend

Checks:
- Ensure the backend is running on port `8000`
- Confirm the frontend's `API_BASE_URL` value matches the backend URL
- Verify no CORS restrictions block requests

### Review creation fails

Common causes:
- employee ID does not exist
- review period ID does not exist
- selected review period is closed
- duplicate review already exists for the employee and period
- rating value is outside 1–5

### Dependency issues

If Python packages are missing:

```bash
cd backend
pip install -r requirement.txt
```

If frontend dependencies are missing:

```bash
cd frontend/employeereview
npm install
```

## Notes

- The backend route prefix is `/api`, matching the frontend API base URL.
- The frontend allows navigation between several views and uses a local state pattern to manage selected menu items and review details.
- The SQL schema intentionally prevents review submission for closed periods at the database level, adding a security and consistency guard beyond frontend validation.
- The backend uses Pydantic models to enforce validation rules before records reach the database layer.

This project is designed as a practical employee performance review application and can be extended with features like authentication, role-based access, export reports, audit trails, or dashboards.
