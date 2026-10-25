import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import ReviewPeriods from './ReviewPeriods'

const { useReviewPeriods } = vi.hoisted(() => ({ useReviewPeriods: vi.fn() }))

vi.mock('../hooks/useResources', () => ({ useReviewPeriods }))
vi.mock('./ReviewPeriodForm', () => ({
  default: ({
    periodId,
    onCancel,
  }: {
    periodId?: number
    onCancel: () => void
  }) => (
    <div>
      <p>{periodId === undefined ? 'Adding review period' : `Editing period ${periodId}`}</p>
      <button type="button" onClick={onCancel}>Cancel form</button>
    </div>
  ),
}))

describe('ReviewPeriods', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useReviewPeriods.mockReturnValue({
      data: [
        { id: 4, name: '2026 H1', start_date: '2026-01-01', end_date: '2026-06-30', status: 'Open' },
      ],
      isLoading: false,
      error: null,
    })
  })

  it('renders period details', () => {
    render(<ReviewPeriods />)

    expect(screen.getByRole('heading', { name: 'Review Periods' })).toBeTruthy()
    expect(screen.getByText('2026 H1')).toBeTruthy()
    expect(screen.getByText('2026-01-01')).toBeTruthy()
    expect(screen.getByText('2026-06-30')).toBeTruthy()
    expect(screen.getByText('Showing 1 to 1 of 1 review periods')).toBeTruthy()
  })

  it('opens an existing period for editing and can cancel', () => {
    render(<ReviewPeriods />)

    fireEvent.click(screen.getByRole('button', { name: 'View' }))
    expect(screen.getByText('Editing period 4')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Cancel form' }))
    expect(screen.getByRole('heading', { name: 'Review Periods' })).toBeTruthy()
  })

  it('shows an empty state', () => {
    useReviewPeriods.mockReturnValue({ data: [], isLoading: false, error: null })
    render(<ReviewPeriods />)

    expect(screen.getByText('No review periods found.')).toBeTruthy()
  })
})
