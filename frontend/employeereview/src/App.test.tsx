import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import App from './App'

vi.mock('./compontents/SubmitReview', () => ({
  default: () => <div>Submit Review Form</div>,
}))
vi.mock('./compontents/Employees', () => ({
  default: () => <div>Employee Directory</div>,
}))
vi.mock('./compontents/ReviewPeriods', () => ({
  default: () => <div>Review Period Directory</div>,
}))
vi.mock('./compontents/ReviewList', () => ({
  default: ({ onView }: { onView: (review: {
    employeeId: string
    employeeName: string
    period: string
    ratings: string
    average: string
    status: 'Completed'
  }) => void }) => (
    <button
      type="button"
      onClick={() => onView({
        employeeId: 'E-1',
        employeeName: 'Alex Doe',
        period: '2026 H1',
        ratings: '5, 4, 3',
        average: '4.0',
        status: 'Completed',
      })}
    >
      Open review
    </button>
  ),
}))

describe('App', () => {
  it('shows the default page and switches between navigation sections', () => {
    render(<App />)

    expect(screen.getByText('Submit Review Form')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: /Employees/ }))
    expect(screen.getByText('Employee Directory')).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: /Review Period/ }))
    expect(screen.getByText('Review Period Directory')).toBeTruthy()
  })

  it('opens a review detail and returns to the review list', () => {
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: 'Reviews' }))
    fireEvent.click(screen.getByRole('button', { name: 'Open review' }))

    expect(screen.getByText('E-1 - Alex Doe')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Back to List' }))
    expect(screen.getByRole('button', { name: 'Open review' })).toBeTruthy()
  })
})
