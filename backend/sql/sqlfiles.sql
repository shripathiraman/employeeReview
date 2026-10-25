DROP TABLE IF EXISTS performance_reviews;
DROP TABLE IF EXISTS review_periods;
DROP TABLE IF EXISTS employees;
DROP FUNCTION IF EXISTS require_open_review_period();

CREATE TABLE employees (
    id          SERIAL PRIMARY KEY,
    employee_id VARCHAR(20)  NOT NULL UNIQUE,
    name        VARCHAR(100) NOT NULL,
    department  VARCHAR(100),
    email       VARCHAR(100),
    status      VARCHAR(20) DEFAULT 'Active'
);

CREATE TABLE review_periods (
    id         SERIAL PRIMARY KEY,
    name       VARCHAR(50) NOT NULL,
    start_date DATE        NOT NULL,
    end_date   DATE        NOT NULL,
    status     VARCHAR(20) DEFAULT 'Open',

    CONSTRAINT review_period_dates_valid
        CHECK (end_date >= start_date)
);

CREATE TABLE performance_reviews (
    id               SERIAL PRIMARY KEY,
    employee_id      INTEGER NOT NULL REFERENCES employees(id),
    period_id        INTEGER NOT NULL REFERENCES review_periods(id),
    quality_rating   INTEGER NOT NULL CHECK (quality_rating BETWEEN 1 AND 5),
    delivery_rating  INTEGER NOT NULL CHECK (delivery_rating BETWEEN 1 AND 5),
    teamwork_rating  INTEGER NOT NULL CHECK (teamwork_rating BETWEEN 1 AND 5),
    average_rating   NUMERIC(3,2) NULL CHECK (average_rating BETWEEN 1 AND 5),
    comments         TEXT,
    created_at       TIMESTAMP DEFAULT NOW(),

    CONSTRAINT one_review_per_employee_per_period
        UNIQUE (employee_id, period_id)
);

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

CREATE TRIGGER performance_reviews_open_period
BEFORE INSERT OR UPDATE OF period_id ON performance_reviews
FOR EACH ROW
EXECUTE FUNCTION require_open_review_period();