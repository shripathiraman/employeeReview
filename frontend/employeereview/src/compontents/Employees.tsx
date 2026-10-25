import { useEffect, useState } from 'react'
import type { Employee } from '../api/resources'
import { useEmployees } from '../hooks/useResources'
import { usePagination } from '../hooks/usePagination'
import EmployeeForm from './EmployeeForm'
import Pagination from './Pagination'

function Employees() {
  const employeeResource = useEmployees()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [isAdding, setIsAdding] = useState(false)
  const [employeeToEdit, setEmployeeToEdit] = useState<string | null>(null)

  useEffect(() => {
    if (employeeResource.data) {
      setEmployees(employeeResource.data)
    }
  }, [employeeResource.data])

  const pagination = usePagination(employees.length, 5)
  const visibleEmployees = employees.slice(
    pagination.startIndex,
    pagination.startIndex + pagination.pageSize,
  )

  const handleSaved = (savedEmployee: Employee) => {
    setEmployees((currentEmployees) => {
      const alreadyExists = currentEmployees.some(
        (employee) => employee.id === savedEmployee.id,
      )

      if (alreadyExists) {
        return currentEmployees.map((employee) =>
          employee.id === savedEmployee.id ? savedEmployee : employee,
        )
      }

      return [savedEmployee, ...currentEmployees]
    })

    setIsAdding(false)
    setEmployeeToEdit(null)
    pagination.resetPage()
  }

  if (isAdding || employeeToEdit !== null) {
    return (
      <EmployeeForm
        employeeId={employeeToEdit ?? undefined}
        onCancel={() => {
          setIsAdding(false)
          setEmployeeToEdit(null)
        }}
        onSaved={handleSaved}
      />
    )
  }

  return (
    <section className="review-list" aria-labelledby="employees-title">
      <div className="review-list-header">
        <h2 id="employees-title">Employees</h2>
        <button
          className="review-search-button"
          type="button"
          onClick={() => setIsAdding(true)}
        >
          + Add Employee
        </button>
      </div>

      <div className="review-table-wrapper">
        <table className="review-table">
          <thead>
            <tr>
              <th>Employee ID</th>
              <th>Name</th>
              <th>Department</th>
              <th>Email</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {employeeResource.isLoading && (
              <tr>
                <td colSpan={6}>Loading employees...</td>
              </tr>
            )}

            {employeeResource.error && !employeeResource.isLoading && (
              <tr>
                <td colSpan={6}>{employeeResource.error}</td>
              </tr>
            )}

            {!employeeResource.isLoading &&
              !employeeResource.error &&
              visibleEmployees.map((employee) => (
                <tr key={employee.id}>
                  <td>{employee.employee_id}</td>
                  <td>{employee.name}</td>
                  <td>{employee.department ?? '—'}</td>
                  <td>{employee.email ?? '—'}</td>
                  <td>{employee.status}</td>
                  <td>
                    <button
                      className="review-view-button"
                      type="button"
                      onClick={() => setEmployeeToEdit(employee.employee_id)}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}

            {!employeeResource.isLoading &&
              !employeeResource.error &&
              employees.length === 0 && (
                <tr>
                  <td colSpan={6}>No employees found.</td>
                </tr>
              )}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={pagination.currentPage}
        totalItems={employees.length}
        pageSize={pagination.pageSize}
        itemName="employees"
        onPageChange={pagination.goToPage}
      />
    </section>
  )
}

export default Employees