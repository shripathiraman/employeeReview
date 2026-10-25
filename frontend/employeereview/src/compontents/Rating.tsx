import { useState } from 'react'

type RatingProps = {
  value?: number
  onChange?: (rating: number) => void
  disabled?: boolean
  label?: string
}

const STAR_COUNT = 5

function Rating({ value, onChange, disabled = false, label = 'Rating' }: RatingProps) {
  const [internalValue, setInternalValue] = useState(0)
  const selectedValue = value ?? internalValue

  const handleRatingChange = (rating: number) => {
    if (disabled) return

    if (value === undefined) {
      setInternalValue(rating)
    }

    onChange?.(rating)
  }

  return (
    <div role="group" aria-label={label} style={{ display: 'inline-flex', gap: '4px' }}>
      {Array.from({ length: STAR_COUNT }, (_, index) => {
        const rating = index + 1
        const isSelected = rating <= selectedValue

        return (
          <button
            key={rating}
            type="button"
            aria-label={`${rating} star${rating === 1 ? '' : 's'}`}
            aria-pressed={isSelected}
            disabled={disabled}
            onClick={() => handleRatingChange(rating)}
            style={{
              padding: 0,
              border: 0,
              color: isSelected ? '#f5c518' : '#cbd5e1',
              background: 'transparent',
              cursor: disabled ? 'default' : 'pointer',
              fontSize: '24px',
              lineHeight: 1,
            }}
          >
            ★
          </button>
        )
      })}
    </div>
  )
}

export default Rating
