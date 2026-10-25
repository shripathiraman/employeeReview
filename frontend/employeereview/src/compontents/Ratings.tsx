interface RatingsProps {
  rating: number;
  editable?: boolean;
  onRatingChange?: (rating: number) => void;
}

export default function Ratings({
  rating,
  editable = false,
  onRatingChange,
}: RatingsProps) {
  return (
    <div className="rating-stars" role="radiogroup" aria-label="Quality of Work rating">
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = star <= rating;
        const isHalf = star - 0.5 === rating;
        const nextRating = rating === star - 0.5 ? star : star - 0.5;

        return (
        <button
          key={star}
          type="button"
          className={`rating-star ${isFilled ? "filled" : isHalf ? "half" : "empty"}`}
          disabled={!editable}
          aria-label={`${star} star${star === 1 ? '' : 's'}`}
          aria-checked={star === rating}
          role="radio"
          onClick={() => onRatingChange?.(nextRating)}
        >
          {'\u2605'}
        </button>
        );
      })}
    </div>
  )
}
