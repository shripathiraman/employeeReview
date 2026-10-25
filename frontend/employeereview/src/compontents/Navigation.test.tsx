import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import Navigation from './Navigation'

describe('Navigation', () => {
  it('marks the active page and reports menu selections', () => {
    const onMenuSelect = vi.fn()
    render(<Navigation activeMenu="Reviews" onMenuSelect={onMenuSelect} />)

    expect(screen.getByRole('button', { name: 'Reviews' }).getAttribute('aria-current')).toBe('page')
    expect(screen.getByRole('button', { name: 'Employees' }).hasAttribute('aria-current')).toBe(false)

    fireEvent.click(screen.getByRole('button', { name: /Employees/ }))
    expect(onMenuSelect).toHaveBeenCalledWith('Employees')
  })
})
