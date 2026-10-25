
import { useState } from "react";
import "./Ratings.css";

interface RatingItem {
  label: string;
  rating: number;
}

const initialRatings: RatingItem[] = [
  { label: "Quality of Work", rating: 4 },
  { label: "Delivery & Ownership", rating: 4 },
  { label: "Teamwork & Collaboration", rating: 4 },
];

export default function Ratings() {
  const [ratings, setRatings] = useState<RatingItem[]>(initialRatings);

  function handleRatingChange(label: string, rating: number) {
    setRatings((previous) =>
      previous.map((item) =>
        item.label === label
          ? { ...item, rating }
          : item
      )
    );
  }

  return (
    <div className="ratings">
      <h3 className="ratings-header">
        Performance Ratings (1-5)
      </h3>

      {ratings.map((item) => (
        <div className="rating-row" key={item.label}>
          <span className="rating-label">{item.label}</span>

          <div className="rating-stars">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className={`rating-star ${
                  star <= item.rating ? "filled" : "empty"
                }`}
                onClick={() =>
                  handleRatingChange(item.label, star)
                }
                aria-label={`${item.label}: ${star} stars`}
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
