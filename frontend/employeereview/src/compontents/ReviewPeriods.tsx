import { useEffect, useState } from 'react'
import type { ReviewPeriod } from '../api/resources'
import { useReviewPeriods } from '../hooks/useResources'
import { usePagination } from '../hooks/usePagination'
import Pagination from './Pagination'
import ReviewPeriodForm from './ReviewPeriodForm'

function ReviewPeriods() {
  const reviewPeriodResource = useReviewPeriods()
  const [periods, setPeriods] = useState<ReviewPeriod[]>([])
  const [isAdding, setIsAdding] = useState(false)
  const [periodToEdit, setPeriodToEdit] = useState<number | null>(null)

  useEffect(() => {
    if (reviewPeriodResource.data) {
      setPeriods(reviewPeriodResource.data)
    }
  }, [reviewPeriodResource.data])

  const pagination = usePagination(periods.length, 5)
  const visiblePeriods = periods.slice(
    pagination.startIndex,
    pagination.startIndex + pagination.pageSize,
  )

  const handleSaved = (savedPeriod: ReviewPeriod) => {
    setPeriods((currentPeriods) => {
      const alreadyExists = currentPeriods.some(
        (period) => period.id === savedPeriod.id,
      )

      if (alreadyExists) {
        return currentPeriods.map((period) =>
          period.id === savedPeriod.id ? savedPeriod : period,
        )
      }

      return [savedPeriod, ...currentPeriods]
    })

    setIsAdding(false)
    setPeriodToEdit(null)
    pagination.resetPage()
  }

  if (isAdding || periodToEdit !== null) {
    return (
      <ReviewPeriodForm
        periodId={periodToEdit ?? undefined}
        onCancel={() => {
          setIsAdding(false)
          setPeriodToEdit(null)
        }}
        onSaved={handleSaved}
      />
    )
  }

  return (
    <section className="review-list" aria-labelledby="review-periods-title">
      <div className="review-list-header">
        <h2 id="review-periods-title">Review Periods</h2>
        <button
          className="review-search-button"
          type="button"
          onClick={() => setIsAdding(true)}
        >
          + Add Review Period
        </button>
      </div>

      <div className="review-table-wrapper">
        <table className="review-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {reviewPeriodResource.isLoading && (
              <tr>
                <td colSpan={6}>Loading review periods...</td>
              </tr>
            )}

            {reviewPeriodResource.error && !reviewPeriodResource.isLoading && (
              <tr>
                <td colSpan={6}>{reviewPeriodResource.error}</td>
              </tr>
            )}

            {!reviewPeriodResource.isLoading &&
              !reviewPeriodResource.error &&
              visiblePeriods.map((period) => (
                <tr key={period.id}>
                  <td>{period.id}</td>
                  <td>{period.name}</td>
                  <td>{period.start_date}</td>
                  <td>{period.end_date}</td>
                  <td>{period.status}</td>
                  <td>
                    <button
                      className="review-view-button"
                      type="button"
                      onClick={() => setPeriodToEdit(period.id)}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}

            {!reviewPeriodResource.isLoading &&
              !reviewPeriodResource.error &&
              periods.length === 0 && (
                <tr>
                  <td colSpan={6}>No review periods found.</td>
                </tr>
              )}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={pagination.currentPage}
        totalItems={periods.length}
        pageSize={pagination.pageSize}
        itemName="review periods"
        onPageChange={pagination.goToPage}
      />
    </section>
  )
}

export default ReviewPeriods