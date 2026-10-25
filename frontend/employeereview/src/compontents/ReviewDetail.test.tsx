import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import ReviewDetail from './ReviewDetail'

const review = {
  employeeId: 'E-24',
  employeeName: 'Jordan Lee',
  period: '2026 H1',
  ratings: '5, 4, 3',
  average: '4.0',
  status: 'Completed' as const,
}

describe('ReviewDetail', () => {
  it('shows review summary and criterion ratings', () => {
    render(<ReviewDetail review={review} onBack={vi.fn()} />)

    expect(screen.getByRole('heading', { name: 'Review Details' })).toBeTruthy()
    expect(screen.getByText('E-24 - Jordan Lee')).toBeTruthy()
    expect(screen.getByText('2026 H1 (Jan - Jun)')).toBeTruthy()
    expect(screen.getByText('4.0 / 5')).toBeTruthy()
    expect(screen.getByText('Quality of Work')).toBeTruthy()
    expect(screen.getByLabelText('5 out of 5 stars')).toBeTruthy()
    expect(screen.getByLabelText('4 out of 5 stars')).toBeTruthy()
  })

  it('calls the back handler', () => {
    const onBack = vi.fn()
    render(<ReviewDetail review={review} onBack={onBack} />)

    fireEvent.click(screen.getByRole('button', { name: 'Back to List' }))
    expect(onBack).toHaveBeenCalledOnce()
  })
})
