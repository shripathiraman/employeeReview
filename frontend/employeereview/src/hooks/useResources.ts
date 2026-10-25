import { useCallback } from 'react'
import { getEmployees, getReviewPeriods, getReviews } from '../api/resources'
import { useApiResource } from './useApiResource'

export function useEmployees() {
  return useApiResource(useCallback(getEmployees, []))
}

export function useReviewPeriods() {
  return useApiResource(useCallback(getReviewPeriods, []))
}

export function useReviews(employeeId?: number, periodId?: number) {
  const loadReviews = useCallback(
    () => getReviews(employeeId, periodId),
    [employeeId, periodId],
  )

  return useApiResource(loadReviews)
}
