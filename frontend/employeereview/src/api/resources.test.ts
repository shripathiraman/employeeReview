import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  apiGet,
  apiPost,
} from './client'
import {
  createReview,
  getEmployee,
  getEmployees,
  getReviewPeriod,
  getReviewPeriods,
  getReviews,
  saveEmployee,
  saveReviewPeriod,
} from './resources'

vi.mock('./client', () => ({
  apiGet: vi.fn(),
  apiPost: vi.fn(),
}))

describe('API resources', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('requests employees and encodes employee IDs in paths', () => {
    getEmployees()
    getEmployee('employee/1')

    expect(apiGet).toHaveBeenNthCalledWith(1, '/employees')
    expect(apiGet).toHaveBeenNthCalledWith(2, '/employees/employee%2F1')
  })

  it('posts employee and review-period data', () => {
    const employee = {
      employee_id: 'E-1',
      name: 'Alex Doe',
      department: null,
      email: null,
      status: 'Active',
    }
    const period = {
      name: '2026 H1',
      start_date: '2026-01-01',
      end_date: '2026-06-30',
      status: 'Open',
    }

    saveEmployee(employee)
    saveReviewPeriod(period)

    expect(apiPost).toHaveBeenNthCalledWith(1, '/employees', employee)
    expect(apiPost).toHaveBeenNthCalledWith(2, '/review-periods', period)
  })

  it('requests review periods and a period by ID', () => {
    getReviewPeriods()
    getReviewPeriod(12)

    expect(apiGet).toHaveBeenNthCalledWith(1, '/review-periods')
    expect(apiGet).toHaveBeenNthCalledWith(2, '/review-periods/12')
  })

  it('includes only supplied review filters in the query', () => {
    getReviews()
    getReviews(4)
    getReviews(undefined, 7)
    getReviews(4, 7)

    expect(apiGet).toHaveBeenNthCalledWith(1, '/reviews')
    expect(apiGet).toHaveBeenNthCalledWith(2, '/reviews?employee_id=4')
    expect(apiGet).toHaveBeenNthCalledWith(3, '/reviews?period_id=7')
    expect(apiGet).toHaveBeenNthCalledWith(4, '/reviews?employee_id=4&period_id=7')
  })

  it('posts a review payload', () => {
    const review = {
      employee_id: 4,
      period_id: 7,
      quality_rating: 5,
      delivery_rating: 4,
      teamwork_rating: 3,
      comments: 'Well done',
    }

    createReview(review)

    expect(apiPost).toHaveBeenCalledWith('/reviews', review)
  })
})
