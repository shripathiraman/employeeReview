import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import Employees from './Employees'

const { useEmployees } = vi.hoisted(() => ({ useEmployees: vi.fn() }))

vi.mock('../hooks/useResources', () => ({ useEmployees }))
vi.mock('./EmployeeForm', () => ({
  default: ({
    employeeId,
    onCancel,
  }: {
    employeeId?: string
    onCancel: () => void
  }) => (
    <div>
      <p>{employeeId ? `Editing ${employeeId}` : 'Adding employee'}</p>
      <button type="button" onClick={onCancel}>Cancel form</button>
    </div>
  ),
}))

describe('Employees', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useEmployees.mockReturnValue({
      data: [
        { id: 1, employee_id: 'E-1', name: 'Alex Doe', department: null, email: null, status: 'Active' },
      ],
      isLoading: false,
      error: null,
    })
  })

  it('renders employee values and uses placeholders for missing details', () => {
    render(<Employees />)

    expect(screen.getByRole('heading', { name: 'Employees' })).toBeTruthy()
    expect(screen.getByText('E-1')).toBeTruthy()
    expect(screen.getByText('Alex Doe')).toBeTruthy()
    expect(screen.getAllByText('—').length).toBe(2)
    expect(screen.getByText('Showing 1 to 1 of 1 employees')).toBeTruthy()
  })

  it('opens the employee form and returns to the list when cancelled', () => {
    render(<Employees />)

    fireEvent.click(screen.getByRole('button', { name: 'View' }))
    expect(screen.getByText('Editing E-1')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Cancel form' }))
    expect(screen.getByRole('heading', { name: 'Employees' })).toBeTruthy()
  })

  it('renders loading and error states', () => {
    useEmployees.mockReturnValueOnce({ data: null, isLoading: true, error: null })
    const { rerender } = render(<Employees />)
    expect(screen.getByText('Loading employees...')).toBeTruthy()

    useEmployees.mockReturnValueOnce({ data: null, isLoading: false, error: 'Could not load employees' })
    rerender(<Employees />)
    expect(screen.getByText('Could not load employees')).toBeTruthy()
  })
})
