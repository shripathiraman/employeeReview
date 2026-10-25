import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import EmployeeForm from './EmployeeForm'

const { getEmployee, saveEmployee } = vi.hoisted(() => ({
  getEmployee: vi.fn(),
  saveEmployee: vi.fn(),
}))

vi.mock('../api/resources', () => ({
  getEmployee,
  saveEmployee,
}))

describe('EmployeeForm', () => {
  beforeEach(() => vi.clearAllMocks())

  it('shows validation errors and does not save an incomplete employee', async () => {
    render(<EmployeeForm onCancel={vi.fn()} onSaved={vi.fn()} />)

    fireEvent.click(screen.getByRole('button', { name: 'Save Employee' }))

    expect(await screen.findByText('Please enter an employee ID.')).toBeTruthy()
    expect(screen.getByText('Please enter the employee name.')).toBeTruthy()
    expect(saveEmployee).not.toHaveBeenCalled()
  })

  it('saves normalized optional fields and reports the saved employee', async () => {
    const saved = {
      id: 1,
      employee_id: 'E-1',
      name: 'Alex Doe',
      department: 'Development',
      email: null,
      status: 'Active',
    }
    saveEmployee.mockResolvedValue(saved)
    const onSaved = vi.fn()
    render(<EmployeeForm onCancel={vi.fn()} onSaved={onSaved} />)

    fireEvent.change(screen.getByLabelText(/Employee ID/), { target: { value: 'E-1' } })
    fireEvent.change(screen.getByLabelText(/Name/), { target: { value: 'Alex Doe' } })
    fireEvent.change(screen.getByLabelText('Department'), { target: { value: 'Development' } })
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: '  ' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save Employee' }))

    await waitFor(() => expect(onSaved).toHaveBeenCalledWith(saved))
    expect(saveEmployee).toHaveBeenCalledWith({
      employee_id: 'E-1',
      name: 'Alex Doe',
      department: 'Development',
      email: null,
      status: 'Active',
    })
  })

  it('loads an existing employee and keeps its ID read-only', async () => {
    getEmployee.mockResolvedValue({
      id: 2,
      employee_id: 'E-2',
      name: 'Morgan Smith',
      department: null,
      email: null,
      status: 'Inactive',
    })
    render(<EmployeeForm employeeId="E-2" onCancel={vi.fn()} onSaved={vi.fn()} />)

    const employeeId = await screen.findByDisplayValue('E-2')
    expect(employeeId.hasAttribute('disabled')).toBe(true)
    expect(screen.getByDisplayValue('Morgan Smith')).toBeTruthy()
    expect(screen.getByDisplayValue('Inactive')).toBeTruthy()
    expect(getEmployee).toHaveBeenCalledWith('E-2')
  })

  it('reports a malformed email address', async () => {
    render(<EmployeeForm onCancel={vi.fn()} onSaved={vi.fn()} />)

    fireEvent.change(screen.getByLabelText(/Employee ID/), { target: { value: 'E-3' } })
    fireEvent.change(screen.getByLabelText(/Name/), { target: { value: 'Taylor' } })
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'not-an-email' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save Employee' }))

    expect(await screen.findByText('Please enter a valid email address.')).toBeTruthy()
    expect(saveEmployee).not.toHaveBeenCalled()
  })
})
