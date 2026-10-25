import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import ReviewPeriodForm from './ReviewPeriodForm'

const { getReviewPeriod, saveReviewPeriod } = vi.hoisted(() => ({
  getReviewPeriod: vi.fn(),
  saveReviewPeriod: vi.fn(),
}))

vi.mock('../api/resources', () => ({
  getReviewPeriod,
  saveReviewPeriod,
}))

describe('ReviewPeriodForm', () => {
  beforeEach(() => vi.clearAllMocks())

  it('rejects an end date that is before the start date', async () => {
    render(<ReviewPeriodForm onCancel={vi.fn()} onSaved={vi.fn()} />)

    fireEvent.change(screen.getByLabelText('Name *'), { target: { value: '2026 H1' } })
    fireEvent.change(screen.getByLabelText('Start Date *'), { target: { value: '2026-06-30' } })
    fireEvent.change(screen.getByLabelText('End Date *'), { target: { value: '2026-01-01' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save Review Period' }))

    expect((await screen.findByRole('alert')).textContent).toContain(
      'The end date must be on or after the start date.',
    )
    expect(saveReviewPeriod).not.toHaveBeenCalled()
  })

  it('saves a valid period and reports the result', async () => {
    const period = {
      id: 8,
      name: '2026 H1',
      start_date: '2026-01-01',
      end_date: '2026-06-30',
      status: 'Open',
    }
    saveReviewPeriod.mockResolvedValue(period)
    const onSaved = vi.fn()
    render(<ReviewPeriodForm onCancel={vi.fn()} onSaved={onSaved} />)

    fireEvent.change(screen.getByLabelText('Name *'), { target: { value: period.name } })
    fireEvent.change(screen.getByLabelText('Start Date *'), { target: { value: period.start_date } })
    fireEvent.change(screen.getByLabelText('End Date *'), { target: { value: period.end_date } })
    fireEvent.click(screen.getByRole('button', { name: 'Save Review Period' }))

    await waitFor(() => expect(onSaved).toHaveBeenCalledWith(period))
    expect(saveReviewPeriod).toHaveBeenCalledWith({
      name: period.name,
      start_date: period.start_date,
      end_date: period.end_date,
      status: 'Open',
    })
  })

  it('loads an existing review period for editing', async () => {
    getReviewPeriod.mockResolvedValue({
      id: 8,
      name: '2026 H1',
      start_date: '2026-01-01',
      end_date: '2026-06-30',
      status: 'Closed',
    })
    render(<ReviewPeriodForm periodId={8} onCancel={vi.fn()} onSaved={vi.fn()} />)

    expect(await screen.findByDisplayValue('2026 H1')).toBeTruthy()
    expect(screen.getByDisplayValue('8').hasAttribute('disabled')).toBe(true)
    expect(screen.getByDisplayValue('Closed')).toBeTruthy()
    expect(getReviewPeriod).toHaveBeenCalledWith(8)
  })
})
