import { useEffect, useState, type FormEvent } from 'react'
import {
  getReviewPeriod,
  saveReviewPeriod,
  type ReviewPeriod,
  type ReviewPeriodInput,
} from '../api/resources'

type ReviewPeriodFormProps = {
  periodId?: number
  onCancel: () => void
  onSaved: (period: ReviewPeriod) => void
}

type ReviewPeriodFormValues = {
  name: string
  start_date: string
  end_date: string
  status: string
}

const emptyForm: ReviewPeriodFormValues = {
  name: '',
  start_date: '',
  end_date: '',
  status: 'Open',
}

function ReviewPeriodForm({ periodId, onCancel, onSaved }: ReviewPeriodFormProps) {
  const isEditing = periodId !== undefined
  const [form, setForm] = useState<ReviewPeriodFormValues>(emptyForm)
  const [isLoading, setIsLoading] = useState(isEditing)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (periodId === undefined) return

    let isCurrent = true
    setIsLoading(true)

    getReviewPeriod(periodId)
      .then((period) => {
        if (isCurrent) {
          setForm({
            name: period.name,
            start_date: period.start_date,
            end_date: period.end_date,
            status: period.status,
          })
        }
      })
      .catch((requestError: unknown) => {
        if (isCurrent) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : 'Unable to load review period.',
          )
        }
      })
      .finally(() => {
        if (isCurrent) setIsLoading(false)
      })

    return () => {
      isCurrent = false
    }
  }, [periodId])

  const updateField = (field: keyof ReviewPeriodFormValues, value: string) => {
    setForm((currentForm) => ({ ...currentForm, [field]: value }))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    if (form.end_date < form.start_date) {
      setError('The end date must be on or after the start date.')
      return
    }

    setIsSaving(true)

    const periodInput: ReviewPeriodInput = {
      ...form,
      ...(periodId === undefined ? {} : { id: periodId }),
    }

    try {
      const savedPeriod = await saveReviewPeriod(periodInput)
      onSaved(savedPeriod)
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Unable to save review period.',
      )
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <section className="submit-review-card" aria-labelledby="review-period-form-title">
      <h1 id="review-period-form-title">
        {isEditing ? 'Edit Review Period' : 'Add Review Period'}
      </h1>

      {isLoading ? (
        <p>Loading review period...</p>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="submit-review-fields">
            {isEditing && (
              <label className="submit-review-field">
                <span>Review Period ID</span>
                <input value={periodId} disabled />
              </label>
            )}

            <label className="submit-review-field">
              <span>Name *</span>
              <input
                value={form.name}
                onChange={(event) => updateField('name', event.target.value)}
                maxLength={50}
                required
              />
            </label>

            <label className="submit-review-field">
              <span>Start Date *</span>
              <input
                type="date"
                value={form.start_date}
                onChange={(event) => updateField('start_date', event.target.value)}
                required
              />
            </label>

            <label className="submit-review-field">
              <span>End Date *</span>
              <input
                type="date"
                value={form.end_date}
                onChange={(event) => updateField('end_date', event.target.value)}
                required
              />
            </label>

            <label className="submit-review-field">
              <span>Status *</span>
              <select
                value={form.status}
                onChange={(event) => updateField('status', event.target.value)}
                required
              >
                <option value="Open">Open</option>
                <option value="Closed">Closed</option>
              </select>
            </label>
          </div>

          {error && <p role="alert">{error}</p>}

          <div className="submit-review-actions">
            <button type="button" className="submit-review-reset" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="submit-review-submit" disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Review Period'}
            </button>
          </div>
        </form>
      )}

      {!isLoading && error && (
        <button type="button" className="submit-review-reset" onClick={onCancel}>
          Back
        </button>
      )}
    </section>
  )
}

export default ReviewPeriodForm