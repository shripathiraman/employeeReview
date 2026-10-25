import type { Review } from './ReviewDetail'

type ReviewListProps = {
  onView: (review: Review) => void
}

const reviews: Review[] = [
  { employeeId: 'EMP101', employeeName: 'John Smith', period: 'H1 2026', ratings: '4, 5, 4', average: '4.3', status: 'Completed' },
  { employeeId: 'EMP102', employeeName: 'Sarah Johnson', period: 'H1 2026', ratings: '3, 4, 4', average: '3.7', status: 'Completed' },
  { employeeId: 'EMP103', employeeName: 'Michael Lee', period: 'H1 2026', ratings: '5, 5, 5', average: '5.0', status: 'Completed' },
  { employeeId: 'EMP104', employeeName: 'Priya Sharma', period: 'H1 2026', ratings: '2, 3, 3', average: '2.7', status: 'Completed' },
  { employeeId: 'EMP101', employeeName: 'John Smith', period: 'H2 2025', ratings: '4, 4, 5', average: '4.3', status: 'Completed' },
]

function ReviewList({ onView }: ReviewListProps) {
  return (
    <div className="reviews-page">
      <div className="review-filters" aria-label="Review filters">
        <label>
          <span>Review Period</span>
          <select defaultValue="all">
            <option value="all">All Periods</option>
            <option value="h1-2026">H1 2026</option>
            <option value="h2-2025">H2 2025</option>
          </select>
        </label>
        <label>
          <span>Employee<em>*</em></span>
          <select defaultValue="all">
            <option value="all">All Employees</option>
            <option value="john-smith">John Smith</option>
            <option value="sarah-johnson">Sarah Johnson</option>
            <option value="michael-lee">Michael Lee</option>
            <option value="priya-sharma">Priya Sharma</option>
          </select>
        </label>
        <button className="review-search-button" type="button">
          <span aria-hidden="true">⌕</span> Search
        </button>
      </div>

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
              {reviews.map((review, index) => (
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
          <span>Showing 1 to 5 of 12 reviews</span>
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
