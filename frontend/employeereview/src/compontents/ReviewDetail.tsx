type Review = {
  employeeId: string
  employeeName: string
  period: string
  ratings: string
  average: string
  status: 'Completed' | 'Pending'
}

type ReviewDetailProps = {
  review: Review
  onBack: () => void
}

const criteria = ['Quality of Work', 'Delivery & Ownership', 'Teamwork & Collaboration']

function ReviewDetail({ review, onBack }: ReviewDetailProps) {
  const ratings = review.ratings.split(',').map((rating) => Number(rating.trim()))

  return (
    <section className="review-detail" aria-labelledby="review-detail-title">
      <div className="review-detail-heading">
        <h2 id="review-detail-title">Review Details</h2>
        <button className="review-back-button" type="button" onClick={onBack}>
          Back to List
        </button>
      </div>

      <div className="review-summary">
        <div className="review-summary-item">
          <span>Employee</span>
          <strong>{review.employeeId} - {review.employeeName}</strong>
        </div>
        <div className="review-summary-item">
          <span>Review Period</span>
          <strong>{review.period} (Jan - Jun)</strong>
        </div>
        <div className="review-summary-item review-summary-rating">
          <span>Overall Rating</span>
          <strong>{review.average} / 5</strong>
        </div>
      </div>

      <div className="review-detail-section">
        <h3>Performance Criteria</h3>
        <div className="criteria-table-wrapper">
          <table className="criteria-table">
            <thead>
              <tr><th>Criteria</th><th>Rating</th></tr>
            </thead>
            <tbody>
              {criteria.map((criterion, index) => (
                <tr key={criterion}>
                  <td>{criterion}</td>
                  <td>
                    <span className="detail-stars" aria-label={`${ratings[index] ?? 0} out of 5 stars`}>
                      {Array.from({ length: 5 }, (_, starIndex) => (
                        <span className={starIndex < (ratings[index] ?? 0) ? 'filled' : ''} key={starIndex}>★</span>
                      ))}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="review-detail-section review-comments-section">
        <h3>Manager Comments</h3>
        <p>John has shown strong ownership and consistently delivers high quality work. He is a valuable team member and demonstrates excellent collaboration skills.</p>
      </div>
    </section>
  )
}

export type { Review }
export default ReviewDetail
