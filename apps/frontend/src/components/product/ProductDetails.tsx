import { Fragment, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import {
  clearProductErrors,
  getProductDetails,
  newReview,
  resetReview,
} from "../../services/productSlice";
import toast from "react-hot-toast";
import Loader from "../layout/Loader";
import MetaData from "../layout/MetaData";
import { Carousel } from "react-bootstrap";
import { addItemToCart } from "../../services/cartSlice";
import ListReviews from "../review/ListReview";
import type { AppDispatch, RootState } from "../../store/store";

const ProductDetails = () => {
  const [quantity, setQuantity] = useState<number>(1);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState<string>("");

  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();

  const { loading, error, productDetails, success } = useSelector(
    (state: RootState) => state.productDetails,
  );
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearProductErrors());
      return;
    }
    if (id) {
      dispatch(getProductDetails(id));
    }
    if (success) {
      toast.success("Review posted successfully");
      dispatch(resetReview());
    }
  }, [dispatch, id, error, success]);

  // ✅ Use state instead of DOM query
  const increaseQty = () => {
    if (!productDetails || quantity >= productDetails.stock) return;
    setQuantity((prev) => prev + 1);
  };

  const decreaseQty = () => {
    if (quantity <= 1) return;
    setQuantity((prev) => prev - 1);
  };

  const addToCart = () => {
    if (!id) return;
    dispatch(addItemToCart({ id, quantity }));
    toast.success("Item added to cart.");
  };

  const submitReviewHandler = () => {
    if (!id) return;
    const reviewData = {
      rating,
      comment,
      productId: id,
    };
    dispatch(newReview(reviewData));
    setShowModal(false);
  };

  if (loading) return <Loader />;
  if (!productDetails) return null;

  return (
    <Fragment>
      <MetaData title={productDetails.name} />
      <div className="container container-fluid">
        <div className="row f-flex justify-content-around">
          <div className="col-12 col-lg-5 img-fluid" id="product_image">
            <Carousel pause="hover">
              {productDetails.images?.map((image) => (
                <Carousel.Item key={image.public_id}>
                  <img
                    className="d-block w-100"
                    src={image.url}
                    alt={productDetails.name}
                  />
                </Carousel.Item>
              ))}
            </Carousel>
          </div>

          <div className="col-12 col-lg-5 mt-5">
            <h3>{productDetails.name}</h3>
            <p id="product_id">Product # {productDetails._id}</p>
            <hr />

            <div className="rating-outer">
              <div
                className="rating-inner"
                style={{ width: `${(productDetails.ratings / 5) * 100}%` }}
              />
            </div>
            <span id="no_of_reviews">
              ({productDetails.numOfReviews} Reviews)
            </span>
            <hr />

            <p id="product_price">{productDetails.price}</p>
            <div className="stockCounter d-inline">
              <span className="btn btn-danger minus" onClick={decreaseQty}>
                -
              </span>
              <input
                type="number"
                className="form-control count d-inline"
                value={quantity}
                readOnly
              />
              <span className="btn btn-primary plus" onClick={increaseQty}>
                +
              </span>
            </div>
            <button
              type="button"
              id="cart_btn"
              className="btn btn-primary d-inline ml-4"
              disabled={productDetails.stock === 0}
              onClick={addToCart}
            >
              Add to Cart
            </button>
            <hr />

            <p>
              Status:{" "}
              <span
                id="stock_status"
                className={productDetails.stock > 0 ? "greenColor" : "redColor"}
              >
                {productDetails.stock > 0 ? "In Stock" : "Out of Stock"}
              </span>
            </p>
            <hr />

            <h4 className="mt-2">Description:</h4>
            <p>{productDetails.description}</p>
            <hr />

            <p id="product_seller mb-3">
              Sold by: <strong>{productDetails.seller}</strong>
            </p>

            {user ? (
              <button
                id="review_btn"
                type="button"
                className="btn btn-primary mt-4"
                onClick={() => setShowModal(true)}
              >
                Submit Your Review
              </button>
            ) : (
              <div className="alert alert-danger mt-5">
                Login to post your review
              </div>
            )}

            {/* Review Modal */}
            {showModal && (
              <>
                <div
                  className="modal fade show"
                  style={{ display: "block" }}
                  tabIndex={-1}
                  role="dialog"
                >
                  <div className="modal-dialog" role="document">
                    <div className="modal-content">
                      <div className="modal-header">
                        <h5 className="modal-title">Submit Review</h5>
                        <button
                          type="button"
                          className="close"
                          onClick={() => setShowModal(false)}
                        >
                          <span>&times;</span>
                        </button>
                      </div>
                      <div className="modal-body">
                        <ul
                          className="stars"
                          style={{
                            display: "flex",
                            listStyle: "none",
                            padding: 0,
                          }}
                        >
                          {[1, 2, 3, 4, 5].map((star) => (
                            <li
                              key={star}
                              className="star"
                              style={{
                                cursor: "pointer",
                                fontSize: "2rem",
                                marginRight: "5px",
                              }}
                              onClick={() => setRating(star)}
                            >
                              <i
                                className={`fa fa-star${star <= rating ? "" : "-o"}`}
                                style={{
                                  color: star <= rating ? "#ffb829" : "#ccc",
                                }}
                              />
                            </li>
                          ))}
                        </ul>
                        <textarea
                          name="review"
                          id="review"
                          className="form-control mt-3"
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          placeholder="Write your review..."
                          rows={4}
                        />
                        <button
                          className="btn my-3 float-right review-btn px-4 text-white"
                          onClick={submitReviewHandler}
                          style={{ backgroundColor: "#fa9c23" }}
                        >
                          Submit
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                <div
                  className="modal-backdrop fade show"
                  onClick={() => setShowModal(false)}
                />
              </>
            )}
          </div>
        </div>
      </div>

      {productDetails.reviews && productDetails.reviews.length > 0 && (
        <ListReviews reviews={productDetails.reviews} />
      )}
    </Fragment>
  );
};

export default ProductDetails;
