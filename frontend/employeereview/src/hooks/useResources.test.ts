import { renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getEmployees, getReviewPeriods, getReviews } from '../api/resources'
import { useEmployees, useReviewPeriods, useReviews } from './useResources'

vi.mock('../api/resources', () => ({
  getEmployees: vi.fn().mockResolvedValue([]),
  getReviewPeriods: vi.fn().mockResolvedValue([]),
  getReviews: vi.fn().mockResolvedValue([]),
}))

describe('resource hooks', () => {
  beforeEach(() => vi.clearAllMocks())

  it('loads employees and review periods through their API functions', () => {
    renderHook(() => useEmployees())
    renderHook(() => useReviewPeriods())

    expect(getEmployees).toHaveBeenCalledOnce()
    expect(getReviewPeriods).toHaveBeenCalledOnce()
  })

  it('passes review filters to the API function', () => {
    const initialProps: { employeeId: number | undefined; periodId: number | undefined } = {
      employeeId: 3,
      periodId: 9,
    }
    const { rerender } = renderHook(
      ({ employeeId, periodId }) => useReviews(employeeId, periodId),
      { initialProps },
    )

    expect(getReviews).toHaveBeenCalledWith(3, 9)

    rerender({ employeeId: 5, periodId: undefined })
    expect(getReviews).toHaveBeenLastCalledWith(5, undefined)
  })
})
