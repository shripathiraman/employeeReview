import { act, renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useApiResource } from './useApiResource'

describe('useApiResource', () => {
  it('returns loaded data and finishes loading', async () => {
    const load = vi.fn().mockResolvedValue(['one', 'two'])
    const { result } = renderHook(() => useApiResource(load))

    expect(result.current.isLoading).toBe(true)
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(load).toHaveBeenCalledOnce()
    expect(result.current).toEqual({
      data: ['one', 'two'],
      isLoading: false,
      error: null,
    })
  })

  it('exposes an Error message when loading fails', async () => {
    const load = vi.fn().mockRejectedValue(new Error('Network unavailable'))
    const { result } = renderHook(() => useApiResource(load))

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.data).toBeNull()
    expect(result.current.error).toBe('Network unavailable')
  })

  it('uses a fallback message for non-Error failures', async () => {
    const load = vi.fn().mockRejectedValue('failed')
    const { result } = renderHook(() => useApiResource(load))

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.error).toBe('Unable to load data')
  })

  it('does not update state after the hook unmounts', async () => {
    let resolveLoad!: (value: string) => void
    const load = () => new Promise<string>((resolve) => {
      resolveLoad = resolve
    })
    const { result, unmount } = renderHook(() => useApiResource(load))

    unmount()
    await act(async () => resolveLoad('late response'))

    expect(result.current.data).toBeNull()
    expect(result.current.isLoading).toBe(true)
  })
})
