// src/api/client.test.ts
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { apiGet, apiPost, ApiError } from './client'

describe('API client', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('performs a GET request and returns JSON', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify([{ id: 1 }]), { status: 200 }),
      ),
    )

    await expect(apiGet('/employees')).resolves.toEqual([{ id: 1 }])
    expect(fetch).toHaveBeenCalledWith(
      'http://127.0.0.1:8000/api/employees',
    )
  })

  it('throws ApiError using the server detail message', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ detail: 'Database unavailable' }), {
          status: 503,
        }),
      ),
    )

    await expect(apiGet('/reviews')).rejects.toEqual(
      new ApiError('Database unavailable', 503),
    )
  })

  it('performs a POST request with JSON', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ id: 1 }), { status: 201 }),
      ),
    )

    await expect(
      apiPost('/reviews', { employee_id: 1 }),
    ).resolves.toEqual({ id: 1 })

    expect(fetch).toHaveBeenCalledWith(
      'http://127.0.0.1:8000/api/reviews',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      }),
    )
  })
})