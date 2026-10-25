import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import SubmitReview from './SubmitReview'

const { createReview, useEmployees, useReviewPeriods } = vi.hoisted(() => ({
  createReview: vi.fn(),
  useEmployees: vi.fn(),
  useReviewPeriods: vi.fn(),
}))

vi.mock('../api/resources', () => ({ createReview }))
vi.mock('../hooks/useResources', () => ({ useEmployees, useReviewPeriods }))

describe('SubmitReview', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useEmployees.mockReturnValue({
      data: [{ id: 5, employee_id: 'E-5', name: 'Sam Lee' }],
      isLoading: false,
      error: null,
    })
    useReviewPeriods.mockReturnValue({
      data: [
        { id: 9, name: '2026 H1', status: 'Open' },
        { id: 10, name: '2025 H2', status: 'Closed' },
      ],
      isLoading: false,
      error: null,
    })
  })

  it('validates required fields before submitting', async () => {
    render(<SubmitReview />)

    fireEvent.click(screen.getByRole('button', { name: 'Submit Review' }))

    expect(await screen.findByText('Please select an employee.')).toBeTruthy()
    expect(screen.getByText('Please select a review period.')).toBeTruthy()
    expect(screen.getByText('Please enter your overall comments.')).toBeTruthy()
    expect(createReview).not.toHaveBeenCalled()
  })

  it('submits selected values and resets the form after success', async () => {
    createReview.mockResolvedValue({ id: 23 })
    render(<SubmitReview />)

    fireEvent.change(screen.getByLabelText(/Employee/), { target: { value: '5' } })
    fireEvent.change(screen.getByLabelText('Review Period *'), { target: { value: '9' } })
    fireEvent.click(screen.getByRole('button', { name: 'Quality of Work: 4 out of 5' }))
    fireEvent.click(screen.getByRole('button', { name: 'Delivery & Ownership: 3 out of 5' }))
    fireEvent.click(screen.getByRole('button', { name: 'Teamwork & Collaboration: 5 out of 5' }))
    fireEvent.change(screen.getByLabelText(/Overall Comments/), {
      target: { value: 'Strong collaboration' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Submit Review' }))

    await waitFor(() => expect(createReview).toHaveBeenCalledWith({
      employee_id: 5,
      period_id: 9,
      quality_rating: 4,
      delivery_rating: 3,
      teamwork_rating: 5,
      comments: 'Strong collaboration',
    }))
    expect((await screen.findByRole('status')).textContent).toBe('Review submitted successfully.')
    expect((screen.getByLabelText(/Employee/) as HTMLSelectElement).value).toBe('')
    expect((screen.getByLabelText(/Overall Comments/) as HTMLTextAreaElement).value).toBe('')
  })

  it('does not allow choosing a closed review period', () => {
    render(<SubmitReview />)

    expect(screen.getByRole('option', { name: '2025 H2 (closed)' }).hasAttribute('disabled')).toBe(true)
  })
})
