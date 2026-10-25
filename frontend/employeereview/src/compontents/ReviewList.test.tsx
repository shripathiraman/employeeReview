import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Review } from './ReviewDetail'
import ReviewList from './ReviewList'

const { useEmployees, useReviewPeriods, useReviews } = vi.hoisted(() => ({
  useEmployees: vi.fn(),
  useReviewPeriods: vi.fn(),
  useReviews: vi.fn(),
}))

vi.mock('../hooks/useResources', () => ({
  useEmployees,
  useReviewPeriods,
  useReviews,
}))

describe('ReviewList', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useEmployees.mockReturnValue({
      data: [{ id: 11, employee_id: 'E-11', name: 'Jamie Lee' }],
      isLoading: false,
      error: null,
    })
    useReviewPeriods.mockReturnValue({
      data: [{ id: 7, name: '2026 H1', status: 'Open' }],
      isLoading: false,
      error: null,
    })
    useReviews.mockReturnValue({
      data: [{
        id: 3,
        employee_id: 11,
        employee_name: 'Jamie Lee',
        period_id: 7,
        period_name: '2026 H1',
        quality_rating: 5,
        delivery_rating: 4,
        teamwork_rating: 3,
        average_rating: 4,
        comments: null,
        created_at: '2026-06-30',
      }],
      isLoading: false,
      error: null,
    })
  })

  it('maps API review data for display and emits the selected review', () => {
    const onView = vi.fn<(review: Review) => void>()
    render(<ReviewList onView={onView} />)

    expect(screen.getByText('E-11')).toBeTruthy()
    expect(screen.getByText('Jamie Lee')).toBeTruthy()
    expect(screen.getByText('5, 4, 3')).toBeTruthy()
    expect(screen.getByText('4.0')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'View' }))

    expect(onView).toHaveBeenCalledWith({
      employeeId: 'E-11',
      employeeName: 'Jamie Lee',
      period: '2026 H1',
      ratings: '5, 4, 3',
      average: '4.0',
      status: 'Completed',
    })
  })

  it('applies selected filters only after submitting the search form', () => {
    render(<ReviewList onView={vi.fn()} />)

    fireEvent.change(screen.getByLabelText('Review Period'), { target: { value: '7' } })
    fireEvent.change(screen.getByLabelText('Employee'), { target: { value: '11' } })
    expect(useReviews).toHaveBeenLastCalledWith(undefined, undefined)

    fireEvent.click(screen.getByRole('button', { name: /Search/ }))
    expect(useReviews).toHaveBeenLastCalledWith(11, 7)
  })

  it('renders empty and error states', () => {
    useReviews.mockReturnValueOnce({ data: [], isLoading: false, error: null })
    const { rerender } = render(<ReviewList onView={vi.fn()} />)
    expect(screen.getByText('No reviews found.')).toBeTruthy()

    useReviews.mockReturnValueOnce({ data: null, isLoading: false, error: 'Unable to load reviews' })
    rerender(<ReviewList onView={vi.fn()} />)
    expect(screen.getByText('Unable to load reviews')).toBeTruthy()
  })
})
