import './Ratings.css'

interface RatingItem {
  label: string
  rating: number
}

interface RatingsProps {
  ratings: RatingItem[]
  editable?: boolean
  onRatingChange?: (label: string, rating: number) => void
}

export default function Ratings({ ratings, editable = false, onRatingChange }: RatingsProps) {
  return (
    <div className="ratings">
      {ratings.map((item) => (
        <div className="rating-row" key={item.label}>
          <span className="rating-label">
            {item.label}
            {editable && <span className="required">*</span>}
          </span>

          <div className="rating-stars" role="radiogroup" aria-label={`${item.label} rating`}>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className={`rating-star ${star <= item.rating ? 'filled' : 'empty'}`}
                disabled={!editable}
                aria-label={`${star} star${star === 1 ? '' : 's'}`}
                aria-pressed={star <= item.rating}
                onClick={() => onRatingChange?.(item.label, star)}
              >
                {'\u2605'}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
