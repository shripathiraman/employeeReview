import { apiGet, apiPost } from './client'

export type Employee = {
  id: number
  employee_id: string
  name: string
  department: string | null
  email: string | null
  status: string
}

export type ReviewPeriod = {
  id: number
  name: string
  start_date: string
  end_date: string
  status: string
}

export type Review = {
  id: number
  employee_id: number
  employee_name: string
  period_id: number
  period_name: string
  quality_rating: number
  delivery_rating: number
  teamwork_rating: number
  average_rating: number
  comments: string | null
  created_at: string
}

// These are the values the backend needs when a new review is submitted.
export type CreateReview = {
  employee_id: number
  period_id: number
  quality_rating: number
  delivery_rating: number
  teamwork_rating: number
  comments: string
}

export type EmployeeInput = {
  employee_id: string
  name: string
  department: string | null
  email: string | null
  status: string
}

export type ReviewPeriodInput = {
  id?: number
  name: string
  start_date: string
  end_date: string
  status: string
}

export function getEmployees() {
  return apiGet<Employee[]>('/employees')
}

export function getEmployee(employeeId: string) {
  return apiGet<Employee>(`/employees/${encodeURIComponent(employeeId)}`)
}

export function saveEmployee(employee: EmployeeInput) {
  return apiPost<EmployeeInput, Employee>('/employees', employee)
}

export function getReviewPeriods() {
  return apiGet<ReviewPeriod[]>('/review-periods')
}

export function getReviewPeriod(periodId: number) {
  return apiGet<ReviewPeriod>(`/review-periods/${periodId}`)
}

export function saveReviewPeriod(period: ReviewPeriodInput) {
  return apiPost<ReviewPeriodInput, ReviewPeriod>('/review-periods', period)
}

export function getReviews(employeeId?: number, periodId?: number) {
  const query = new URLSearchParams()

  if (employeeId !== undefined) query.set('employee_id', String(employeeId))
  if (periodId !== undefined) query.set('period_id', String(periodId))

  const queryString = query.toString()
  const path = queryString ? `/reviews?${queryString}` : '/reviews'

  return apiGet<Review[]>(path)
}

export function createReview(review: CreateReview) {
  return apiPost<CreateReview, Review>('/reviews', review)
}
