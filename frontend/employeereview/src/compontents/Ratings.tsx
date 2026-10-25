interface RatingsProps {
  rating: number;
  label: string;
  editable?: boolean;
  onRatingChange?: (rating: number) => void;
}

export default function Ratings({
  rating,
  label,
  editable = false,
  onRatingChange,
}: RatingsProps) {
  return (
    <div className="rating-stars" role="group" aria-label={`${label} rating`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={`rating-star ${star <= rating ? 'filled' : 'empty'}`}
          disabled={!editable}
          aria-label={`${label}: ${star} out of 5`}
          aria-pressed={star === rating}
          onClick={() => onRatingChange?.(star)}
        >
          {'\u2605'}
        </button>
      ))}
    </div>
  )
}
