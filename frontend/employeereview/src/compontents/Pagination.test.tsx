import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import Pagination from './Pagination'

describe('Pagination', () => {
  it('shows the item range and disables navigation at the first page', () => {
    render(
      <Pagination
        currentPage={1}
        totalItems={12}
        pageSize={5}
        itemName="employees"
        onPageChange={vi.fn()}
      />,
    )

    expect(screen.getByText('Showing 1 to 5 of 12 employees')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'First page' }).hasAttribute('disabled')).toBe(true)
    expect(screen.getByRole('button', { name: 'Previous page' }).hasAttribute('disabled')).toBe(true)
    expect(screen.getByRole('button', { name: 'Page 1' }).getAttribute('aria-current')).toBe('page')
  })

  it('reports page navigation and blocks out-of-range buttons', () => {
    const onPageChange = vi.fn()
    render(
      <Pagination
        currentPage={2}
        totalItems={12}
        pageSize={5}
        onPageChange={onPageChange}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Next page' }))
    expect(onPageChange).toHaveBeenCalledWith(3)

    fireEvent.click(screen.getByRole('button', { name: 'Page 1' }))
    expect(onPageChange).toHaveBeenCalledWith(1)

    expect(screen.getByText('Showing 6 to 10 of 12 items')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Next page' }).hasAttribute('disabled')).toBe(false)
  })

  it('renders a zero range for an empty list', () => {
    render(
      <Pagination
        currentPage={1}
        totalItems={0}
        pageSize={5}
        onPageChange={vi.fn()}
      />,
    )

    expect(screen.getByText('Showing 0 to 0 of 0 items')).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Page 1' })).toBeNull()
  })
})
