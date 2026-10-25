import { useState, type FormEvent } from 'react'
import { createReview } from '../api/resources'
import { useEmployees, useReviewPeriods } from '../hooks/useResources'
import Ratings from './Ratings'

const ratingCriteria = [
  { name: 'quality', label: 'Quality of Work' },
  { name: 'delivery', label: 'Delivery & Ownership' },
  { name: 'teamwork', label: 'Teamwork & Collaboration' },
] as const

type RatingValues = Record<(typeof ratingCriteria)[number]['name'], number>
type ValidationErrors = {
  employeeId?: string
  periodId?: string
  comments?: string
} & Partial<Record<(typeof ratingCriteria)[number]['name'], string>>

const initialRatings: RatingValues = {
  quality: 0,
  delivery: 0,
  teamwork: 0,
}

function SubmitReview() {
  const [employeeId, setEmployeeId] = useState('')
  const [periodId, setPeriodId] = useState('')
  const [ratings, setRatings] = useState<RatingValues>(initialRatings)
  const [comments, setComments] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})
  const employees = useEmployees()
  const reviewPeriods = useReviewPeriods()

  const updateRating = (name: keyof RatingValues, rating: number) => {
    setRatings((currentRatings) => ({ ...currentRatings, [name]: rating }))
    setValidationErrors((currentErrors) => ({ ...currentErrors, [name]: undefined }))
  }

  const getFieldError = (field: keyof ValidationErrors): string | undefined => {
    if (field === 'employeeId' && !employeeId) return 'Please select an employee.'
    if (field === 'periodId' && !periodId) return 'Please select a review period.'
    if (field === 'comments' && !comments.trim()) return 'Please enter your overall comments.'
    if (field in ratings && ratings[field as keyof RatingValues] < 1) return 'Please choose a rating.'
    return undefined
  }

  const validateField = (field: keyof ValidationErrors) => {
    const error = getFieldError(field)
    setValidationErrors((currentErrors) => ({ ...currentErrors, [field]: error }))
  }

  const validateForm = () => {
    const fields: (keyof ValidationErrors)[] = ['employeeId', 'periodId', 'quality', 'delivery', 'teamwork', 'comments']
    const errors = fields.reduce<ValidationErrors>((currentErrors, field) => {
      const error = getFieldError(field)
      if (error) currentErrors[field] = error
      return currentErrors
    }, {})
    setValidationErrors(errors)
    return Object.keys(errors).length > 0
  }

  const resetForm = () => {
    setEmployeeId('')
    setPeriodId('')
    setRatings({ ...initialRatings })
    setComments('')
    setFormError(null)
    setSuccessMessage(null)
    setValidationErrors({})
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormError(null)
    setSuccessMessage(null)

    if (validateForm()) return

    setIsSubmitting(true)

    try {
      await createReview({
        employee_id: Number(employeeId),
        period_id: Number(periodId),
        quality_rating: ratings.quality,
        delivery_rating: ratings.delivery,
        teamwork_rating: ratings.teamwork,
        comments,
      })

      setSuccessMessage('Review submitted successfully.')
      setEmployeeId('')
      setPeriodId('')
      setRatings({ ...initialRatings })
      setComments('')
      setValidationErrors({})
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Unable to submit the review.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="submit-review-card" aria-labelledby="submit-review-title">
      <h1 id="submit-review-title">Submit Performance Review</h1>

      <form onSubmit={handleSubmit} noValidate>
        <div className="submit-review-fields">
          <label className="submit-review-field">
            <span>Employee <em>*</em></span>
            <select
              value={employeeId}
              onChange={(event) => {
                setEmployeeId(event.target.value)
                setValidationErrors((currentErrors) => ({ ...currentErrors, employeeId: undefined }))
              }}
              onBlur={() => validateField('employeeId')}
              aria-invalid={Boolean(validationErrors.employeeId)}
              aria-describedby={validationErrors.employeeId ? 'employee-error' : undefined}
            >
              <option value="" disabled>Select an employee</option>
              {employees.data?.map((employee) => (
                <option value={employee.id} key={employee.id}>
                  {employee.employee_id} - {employee.name}
                </option>
              ))}
            </select>
            {employees.error && <small>{employees.error}</small>}
            {validationErrors.employeeId && <small id="employee-error" className="field-error">{validationErrors.employeeId}</small>}
          </label>

          <label className="submit-review-field">
            <span>Review Period <em>*</em></span>
            <select
              value={periodId}
              onChange={(event) => {
                setPeriodId(event.target.value)
                setValidationErrors((currentErrors) => ({ ...currentErrors, periodId: undefined }))
              }}
              onBlur={() => validateField('periodId')}
              aria-invalid={Boolean(validationErrors.periodId)}
              aria-describedby={validationErrors.periodId ? 'period-error' : undefined}
            >
              <option value="" disabled>Select a review period</option>
              {reviewPeriods.data?.map((period) => (
                <option
                  value={period.id}
                  key={period.id}
                  disabled={period.status.toLowerCase() !== 'open'}
                >
                  {period.name}{period.status.toLowerCase() !== 'open' ? ' (closed)' : ''}
                </option>
              ))}
            </select>
            {reviewPeriods.error && <small>{reviewPeriods.error}</small>}
            {validationErrors.periodId && <small id="period-error" className="field-error">{validationErrors.periodId}</small>}
          </label>
        </div>

        <div className="submit-review-ratings">
          <h2>Performance Ratings (1 - 5) <em>*</em></h2>
          <div className="submit-review-rating-list">
            {ratingCriteria.map((criterion) => (
              <div className="submit-review-rating-row" key={criterion.name}>
                <div>
                  <span>{criterion.label}</span>
                  {validationErrors[criterion.name] && <small className="field-error">{validationErrors[criterion.name]}</small>}
                </div>
                <div className={validationErrors[criterion.name] ? 'rating-with-error' : undefined}>
                  <Ratings
                    label={criterion.label}
                    rating={ratings[criterion.name]}
                    editable
                    onRatingChange={(rating) => updateRating(criterion.name, rating)}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <label className="submit-review-field submit-review-comments">
          <span>Overall Comments <em>*</em></span>
          <textarea
            value={comments}
            onChange={(event) => {
              setComments(event.target.value)
              setValidationErrors((currentErrors) => ({ ...currentErrors, comments: undefined }))
            }}
            onBlur={() => validateField('comments')}
            aria-invalid={Boolean(validationErrors.comments)}
            aria-describedby={validationErrors.comments ? 'comments-error' : undefined}
            placeholder="Enter your feedback, strengths, areas of improvement..."
          />
          {validationErrors.comments && <small id="comments-error" className="field-error">{validationErrors.comments}</small>}
        </label>

        {formError && <p role="alert">{formError}</p>}
        {successMessage && <p role="status">{successMessage}</p>}

        <div className="submit-review-actions">
          <button type="button" className="submit-review-reset" onClick={resetForm}>Reset</button>
          <button type="submit" className="submit-review-submit" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </div>
      </form>
    </section>
  )
}

export default SubmitReview
