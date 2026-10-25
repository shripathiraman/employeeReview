import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import Ratings from './Ratings'

describe('Ratings', () => {
  it('renders a selected score and disables non-editable stars', () => {
    render(<Ratings label="Quality of Work" rating={3} />)

    expect(screen.getByRole('group', { name: 'Quality of Work rating' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Quality of Work: 3 out of 5' }).getAttribute('aria-pressed')).toBe('true')
    expect(screen.getByRole('button', { name: 'Quality of Work: 4 out of 5' }).hasAttribute('disabled')).toBe(true)
  })

  it('calls the handler when an editable star is selected', () => {
    const onRatingChange = vi.fn()
    render(
      <Ratings
        label="Teamwork"
        rating={2}
        editable
        onRatingChange={onRatingChange}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Teamwork: 5 out of 5' }))
    expect(onRatingChange).toHaveBeenCalledWith(5)
  })
})
