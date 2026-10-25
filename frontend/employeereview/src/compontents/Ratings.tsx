import "./Ratings.css";

interface RatingItem {
  label: string;
  rating: number;
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
      {ratings.map((item) => (
        <div className="rating-row" key={item.label}>
          <span className="rating-label">
            {item.label}
            {editable && <span className="required">*</span>}
          </span>

          <div className="rating-stars">
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
                ★
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}