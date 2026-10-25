import { useEffect, useState, type FormEvent } from 'react'
import { getEmployee, saveEmployee, type Employee, type EmployeeInput } from '../api/resources'

type EmployeeFormProps = {
  employeeId?: string
  onCancel: () => void
  onSaved: (employee: Employee) => void
}

type EmployeeFormValues = {
  employee_id: string
  name: string
  department: string
  email: string
  status: string
}

type ValidationErrors = Partial<Record<keyof EmployeeFormValues, string>>

const departments = [
  'Human Resource',
  'Development',
  'Testing',
  'Business Analyst',
  'Packaging',
]

const statuses = ['Active', 'Inactive']

const emptyForm: EmployeeFormValues = {
  employee_id: '',
  name: '',
  department: '',
  email: '',
  status: 'Active',
}

function EmployeeForm({ employeeId, onCancel, onSaved }: EmployeeFormProps) {
  const isEditing = employeeId !== undefined
  const [form, setForm] = useState<EmployeeFormValues>({
    ...emptyForm,
    employee_id: employeeId ?? '',
  })
  const [isLoading, setIsLoading] = useState(isEditing)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})

  useEffect(() => {
    if (!employeeId) return

    let isCurrent = true
    setIsLoading(true)

    getEmployee(employeeId)
      .then((employee) => {
        if (isCurrent) {
          setForm({
            employee_id: employee.employee_id,
            name: employee.name,
            department: employee.department ?? '',
            email: employee.email ?? '',
            status: employee.status,
          })
        }
      })
      .catch((requestError: unknown) => {
        if (isCurrent) {
          setError(requestError instanceof Error ? requestError.message : 'Unable to load employee.')
        }
      })
      .finally(() => {
        if (isCurrent) setIsLoading(false)
      })

    return () => {
      isCurrent = false
    }
  }, [employeeId])

  const updateField = (field: keyof EmployeeFormValues, value: string) => {
    setForm((currentForm) => ({ ...currentForm, [field]: value }))
    setValidationErrors((currentErrors) => ({ ...currentErrors, [field]: undefined }))
  }

  const getFieldError = (field: keyof EmployeeFormValues): string | undefined => {
    if (field === 'employee_id' && !form.employee_id.trim()) return 'Please enter an employee ID.'
    if (field === 'name' && !form.name.trim()) return 'Please enter the employee name.'
    if (field === 'email' && form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
        return 'Please enter a valid email address.'
    }
    if (field === 'status' && !form.status) return 'Please select a status.'
    return undefined
  }

  const validateField = (field: keyof EmployeeFormValues) => {
    const fieldError = getFieldError(field)
    setValidationErrors((currentErrors) => ({ ...currentErrors, [field]: fieldError }))
  }

  const validateForm = () => {
    const fields: (keyof EmployeeFormValues)[] = ['employee_id', 'name', 'email', 'status']
    const errors = fields.reduce<ValidationErrors>((currentErrors, field) => {
      const fieldError = getFieldError(field)
      if (fieldError) currentErrors[field] = fieldError
      return currentErrors
    }, {})
    setValidationErrors(errors)
    return Object.keys(errors).length > 0
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    if (validateForm()) return

    setIsSaving(true)

    const employeeInput: EmployeeInput = {
      ...form,
      department: form.department.trim() || null,
      email: form.email.trim() || null,
    }

    try {
      const savedEmployee = await saveEmployee(employeeInput)
      onSaved(savedEmployee)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to save employee.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <section className="submit-review-card" aria-labelledby="employee-form-title">
      <h1 id="employee-form-title">{isEditing ? 'Edit Employee' : 'Add Employee'}</h1>

      {isLoading ? (
        <p>Loading employee...</p>
      ) : (
        <form onSubmit={handleSubmit} noValidate>
          <div className="submit-review-fields">
            <label className="submit-review-field">
              <span>Employee ID <em>*</em></span>
              <input
                value={form.employee_id}
                onChange={(event) => updateField('employee_id', event.target.value)}
                onBlur={() => validateField('employee_id')}
                disabled={isEditing}
                aria-invalid={Boolean(validationErrors.employee_id)}
                aria-describedby={validationErrors.employee_id ? 'employee-id-error' : undefined}
              />
              {validationErrors.employee_id && <small id="employee-id-error" className="field-error">{validationErrors.employee_id}</small>}
            </label>

            <label className="submit-review-field">
              <span>Name <em>*</em></span>
              <input
                value={form.name}
                onChange={(event) => updateField('name', event.target.value)}
                onBlur={() => validateField('name')}
                aria-invalid={Boolean(validationErrors.name)}
                aria-describedby={validationErrors.name ? 'name-error' : undefined}
              />
              {validationErrors.name && <small id="name-error" className="field-error">{validationErrors.name}</small>}
            </label>

            <label className="submit-review-field">
              <span>Department</span>
              <select
                value={form.department}
                onChange={(event) => updateField('department', event.target.value)}
              >
                <option value="">Select department</option>
                {departments.map((department) => (
                  <option key={department} value={department}>
                    {department}
                  </option>
                ))}
              </select>
            </label>

            <label className="submit-review-field">
              <span>Email</span>
              <input
                type="email"
                value={form.email}
                onChange={(event) => updateField('email', event.target.value)}
                onBlur={() => validateField('email')}
                aria-invalid={Boolean(validationErrors.email)}
                aria-describedby={validationErrors.email ? 'email-error' : undefined}
              />
              {validationErrors.email && <small id="email-error" className="field-error">{validationErrors.email}</small>}
            </label>

            <label className="submit-review-field">
              <span>Status <em>*</em></span>
              <select
                value={form.status}
                onChange={(event) => updateField('status', event.target.value)}
                onBlur={() => validateField('status')}
                aria-invalid={Boolean(validationErrors.status)}
                aria-describedby={validationErrors.status ? 'status-error' : undefined}
              >
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
              {validationErrors.status && <small id="status-error" className="field-error">{validationErrors.status}</small>}
            </label>
          </div>

          {error && <p role="alert">{error}</p>}

          <div className="submit-review-actions">
            <button type="button" className="submit-review-reset" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="submit-review-submit" disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Employee'}
            </button>
          </div>
        </form>
      )}

      {!isLoading && error && (
        <button type="button" className="submit-review-reset" onClick={onCancel}>
          Back
        </button>
      )}
    </section>
  )
}

export default EmployeeForm
