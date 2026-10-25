import { useState, type FormEvent } from 'react'
import { useEmployees, useReviewPeriods, useReviews } from '../hooks/useResources'
import type { Review as ApiReview } from '../api/resources'
import type { Review } from './ReviewDetail'

type ReviewListProps = {
  onView: (review: Review) => void
}

function mapReview(review: ApiReview, employeeCode: string): Review {
  return {
    employeeId: employeeCode,
    employeeName: review.employee_name,
    period: review.period_name,
    ratings: [review.quality_rating, review.delivery_rating, review.teamwork_rating].join(', '),
    average: review.average_rating.toFixed(1),
    status: 'Completed',
  }
}

function ReviewList({ onView }: ReviewListProps) {
  // Picked filters are applied when the user clicks Search.
  const [employeeFilter, setEmployeeFilter] = useState('all')
  const [periodFilter, setPeriodFilter] = useState('all')
  const [searchedEmployeeId, setSearchedEmployeeId] = useState<number | undefined>()
  const [searchedPeriodId, setSearchedPeriodId] = useState<number | undefined>()

  const employees = useEmployees()
  const reviewPeriods = useReviewPeriods()
  const { data, isLoading, error } = useReviews(searchedEmployeeId, searchedPeriodId)
  const reviews = data?.map((review) => {
    // Review.employee_id is the database ID; show the employee code instead.
    const employeeCode = employees.data?.find((employee) => employee.id === review.employee_id)?.employee_id
      ?? String(review.employee_id)
    return mapReview(review, employeeCode)
  }) ?? []

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSearchedEmployeeId(employeeFilter === 'all' ? undefined : Number(employeeFilter))
    setSearchedPeriodId(periodFilter === 'all' ? undefined : Number(periodFilter))
  }

  return (
    <div className="reviews-page">
      <form className="review-filters" aria-label="Review filters" onSubmit={handleSearch}>
        <label>
          <span>Review Period</span>
          <select value={periodFilter} onChange={(event) => setPeriodFilter(event.target.value)}>
            <option value="all">All Periods</option>
            {reviewPeriods.data?.map((period) => (
              <option value={period.id} key={period.id}>{period.name}</option>
            ))}
          </select>
        </label>
        <label>
          <span>Employee</span>
          <select value={employeeFilter} onChange={(event) => setEmployeeFilter(event.target.value)}>
            <option value="all">All Employees</option>
            {employees.data?.map((employee) => (
              <option value={employee.id} key={employee.id}>
                {employee.employee_id} - {employee.name}
              </option>
            ))}
          </select>
        </label>
        <button className="review-search-button" type="submit">
          <span aria-hidden="true">⌕</span> Search
        </button>
        {(employees.error || reviewPeriods.error) && (
          <small>{employees.error ?? reviewPeriods.error}</small>
        )}
      </form>

      <section className="review-list" aria-labelledby="review-list-title">
        <div className="review-list-header">
          <h2 id="review-list-title">Performance Reviews</h2>
        </div>

        <div className="review-table-wrapper">
          <table className="review-table">
            <thead>
              <tr>
                <th>Employee ID</th>
                <th>Employee Name</th>
                <th>Period</th>
                <th>Ratings</th>
                <th>Average</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={7}>Loading reviews...</td>
                </tr>
              )}
              {error && !isLoading && (
                <tr>
                  <td colSpan={7}>{error}</td>
                </tr>
              )}
              {!isLoading && !error && reviews.map((review, index) => (
                <tr key={`${review.employeeId}-${review.period}-${index}`}>
                  <td>{review.employeeId}</td>
                  <td>{review.employeeName}</td>
                  <td>{review.period}</td>
                  <td>{review.ratings}</td>
                  <td>{review.average}</td>
                  <td><span className={`review-status ${review.status.toLowerCase()}`}>{review.status}</span></td>
                  <td><button className="review-view-button" type="button" onClick={() => onView(review)}>View</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <footer className="review-list-footer">
          <span>Showing {reviews.length} review{reviews.length === 1 ? '' : 's'}</span>
          <nav className="review-pagination" aria-label="Review pages">
            <button type="button" aria-label="Previous page">‹</button>
            <button className="current" type="button" aria-current="page">1</button>
            <button type="button">2</button>
            <button type="button">3</button>
            <button type="button" aria-label="Next page">›</button>
          </nav>
        </footer>
      </section>
    </div>
  )
}

export default ReviewList
