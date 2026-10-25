import type { IReview } from "../../types/productTypes";

interface ListReviewsProps {
  reviews: IReview[];
}

const ListReviews = ({ reviews }: ListReviewsProps) => {
  if (!reviews?.length) {
    return (
      <div className="reviews w-75">
        <h3>Other's Reviews:</h3>
        <hr />
        <p>No reviews yet.</p>
      </div>
    );
  }

  return (
    <div className="reviews w-75">
      <h3>Other's Reviews:</h3>
      <hr />
      {reviews.map((review) => (
        <div key={review._id} className="review-card my-3">
          <div className="rating-outer">
            <div
              className="rating-inner"
              style={{ width: `${(review.rating / 5) * 100}%` }}
            />
          </div>
          <p className="review_user">by {review.name}</p>
          <p className="review_comment">{review.comment}</p>
          <hr />
        </div>
      ))}
    </div>
  );
};

export default ListReviews;
