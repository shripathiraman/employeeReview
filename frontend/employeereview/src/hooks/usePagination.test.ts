import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { usePagination } from './usePagination'

describe('usePagination', () => {
  it('calculates the first page and visible item range', () => {
    const { result } = renderHook(() => usePagination(12, 5))

    expect(result.current).toMatchObject({
      currentPage: 1,
      pageSize: 5,
      totalPages: 3,
      startIndex: 0,
      startItem: 1,
      endItem: 5,
    })
  })

  it('clamps requested pages and calculates the last range', () => {
    const { result } = renderHook(() => usePagination(12, 5))

    act(() => result.current.goToPage(100))
    expect(result.current).toMatchObject({
      currentPage: 3,
      startIndex: 10,
      startItem: 11,
      endItem: 12,
    })

    act(() => result.current.goToPage(0))
    expect(result.current.currentPage).toBe(1)
  })

  it('supports empty lists and resetting the current page', () => {
    const { result, rerender } = renderHook(
      ({ count }) => usePagination(count),
      { initialProps: { count: 0 } },
    )

    expect(result.current).toMatchObject({
      totalPages: 0,
      currentPage: 1,
      startItem: 0,
      endItem: 0,
    })

    rerender({ count: 20 })
    act(() => result.current.goToPage(4))
    act(() => result.current.resetPage())

    expect(result.current.currentPage).toBe(1)
  })
})
