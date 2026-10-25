import "./Ratings.css";

interface RatingItem {
  label: string
  rating: number
}

interface RatingsProps {
  ratings?: RatingItem[];
  editable?: boolean;
  onRatingChange?: (label: string, rating: number) => void;
}

const defaultRatings: RatingItem[] = [
  { label: "Quality of Work", rating: 4 },
  { label: "Delivery & Ownership", rating: 4 },
  { label: "Teamwork & Collaboration", rating: 4 },
];

export default function Ratings({
  ratings = defaultRatings,
  editable = false,
  onRatingChange,
}: RatingsProps) {
  return (
    <div className="ratings">
      <h3 className="ratings-header">
        Performance Ratings (1-5)
      </h3>

      {ratings.map((item) => (
        <div className="rating-row" key={item.label}>
          <span className="rating-label">{item.label}</span>

          <div className="rating-stars" role="radiogroup" aria-label={`${item.label} rating`}>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className={`rating-star ${
                  star <= item.rating ? "filled" : "empty"
                }`}
                disabled={!editable}
                onClick={() => {
                  if (editable) {
                    onRatingChange?.(item.label, star);
                  }
                }}
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
