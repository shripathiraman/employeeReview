/**
 * Centralizes HTTP communication with the backend so components and hooks do
 * not need to duplicate URL construction, response validation, or error handling.
 */
import { API_BASE_URL } from '../config/api'

/** Represents an HTTP request failure returned by the API. */
export class ApiError extends Error {
  status: number

  /** Creates an API error with the server message and HTTP status code. */
  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

/** Converts a failed HTTP response into an ApiError with the server's detail. */
async function makeApiError(response: Response): Promise<ApiError> {
  let message = `Request failed (${response.status})`

  // FastAPI sends useful messages such as duplicate reviews in "detail".
  try {
    const body = await response.json() as { detail?: unknown }
    if (typeof body.detail === 'string') message = body.detail
  } catch {
    // Keep the status-based message if the server did not return JSON.
  }

  return new ApiError(message, response.status)
}

/** Sends a GET request and parses the successful response as the requested type. */
export async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`)

  if (!response.ok) {
    throw await makeApiError(response)
  }

  return response.json() as Promise<T>
}

/** Sends a JSON POST request and parses the successful response as the requested type. */
export async function apiPost<TRequest, TResponse>(
  path: string,
  body: TRequest,
): Promise<TResponse> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    throw await makeApiError(response)
  }

  return response.json() as Promise<TResponse>
}
