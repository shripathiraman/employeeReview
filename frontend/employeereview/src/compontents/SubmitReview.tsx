import { useState, type FormEvent } from 'react'
import Rating from './Rating'

const ratingCriteria = [
  { name: 'quality', label: 'Quality of Work' },
  { name: 'delivery', label: 'Delivery & Ownership' },
  { name: 'teamwork', label: 'Teamwork & Collaboration' },
] as const

type Ratings = Record<(typeof ratingCriteria)[number]['name'], number>

const initialRatings: Ratings = {
  quality: 0,
  delivery: 0,
  teamwork: 0,
}

function SubmitReview() {
  const [ratings, setRatings] = useState<Ratings>(initialRatings)
  const [comments, setComments] = useState('')

  const updateRating = (name: keyof Ratings, rating: number) => {
    setRatings((currentRatings) => ({ ...currentRatings, [name]: rating }))
  }

  const resetForm = () => {
    setRatings(initialRatings)
    setComments('')
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
  }

  return (
    <section className="submit-review-card" aria-labelledby="submit-review-title">
      <h1 id="submit-review-title">Submit Performance Review</h1>

      <form onSubmit={handleSubmit}>
        <div className="submit-review-fields">
          <label className="submit-review-field">
            <span>Employee <em>*</em></span>
            <select defaultValue="EMP101">
              <option value="EMP101">EMP101 - John Smith</option>
              <option value="EMP102">EMP102 - Sarah Johnson</option>
            </select>
          </label>

          <label className="submit-review-field">
            <span>Review Period <em>*</em></span>
            <select defaultValue="H1-2026">
              <option value="H1-2026">H1 2026 (Jan - Jun)</option>
              <option value="H2-2025">H2 2025 (Jul - Dec)</option>
            </select>
          </label>
        </div>

        <div className="submit-review-ratings">
          <h2>Performance Ratings (1 - 5) <em>*</em></h2>
          <div className="submit-review-rating-list">
            {ratingCriteria.map((criterion) => (
              <div className="submit-review-rating-row" key={criterion.name}>
                <span>{criterion.label} <em>*</em></span>
                <Rating
                  label={`${criterion.label} rating`}
                  value={ratings[criterion.name]}
                  onChange={(rating) => updateRating(criterion.name, rating)}
                />
              </div>
            ))}
          </div>
        </div>

        <label className="submit-review-field submit-review-comments">
          <span>Overall Comments <em>*</em></span>
          <textarea
            value={comments}
            onChange={(event) => setComments(event.target.value)}
            placeholder="Enter your feedback, strengths, areas of improvement..."
            required
          />
        </label>

        <div className="submit-review-actions">
          <button type="button" className="submit-review-reset" onClick={resetForm}>Reset</button>
          <button type="submit" className="submit-review-submit">Submit Review</button>
        </div>
      </form>
    </section>
  )
}

export default SubmitReview
