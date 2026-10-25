import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import MetaData from "../layout/MetaData";
import toast from "react-hot-toast";
import {
  DataGrid,
  type GridColDef,
  type GridRenderCellParams,
} from "@mui/x-data-grid";
import Sidebar from "./Sidebar";
import {
  clearProductDetailsErrors,
  deleteReview,
  productReviews,
  resetDeleteProduct,
} from "../../services/productSlice";
import type { AppDispatch, RootState } from "../../store/store";

const ProductReviews = () => {
  const [productId, setProductId] = useState<string>("");
  const dispatch = useDispatch<AppDispatch>();

  const { error, reviews, isDeleted } = useSelector(
    (state: RootState) => state.productDetails,
  );

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearProductDetailsErrors());
    }
    if (isDeleted) {
      toast.success("Review deleted successfully");
      dispatch(resetDeleteProduct());
      if (productId) {
        dispatch(productReviews(productId)); // ✅ refresh reviews after delete
      }
    }
  }, [dispatch, error, isDeleted, productId]);

  const deleteReviewHandler = (reviewId: string) => {
    if (window.confirm("Are you sure you want to delete this review?")) {
      dispatch(deleteReview({ productId, id: reviewId }));
    }
  };

  const submitHandler = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!productId.trim()) {
      toast.error("Please enter a product ID");
      return;
    }
    dispatch(productReviews(productId));
  };

  const columns: GridColDef[] = [
    {
      field: "id",
      headerName: "Review ID",
      flex: 1,
      minWidth: 200,
    },
    {
      field: "rating",
      headerName: "Rating",
      flex: 1,
      minWidth: 100,
      renderCell: (
        params: GridRenderCellParams, // ✅ highlight rating
      ) => (
        <span
          style={{ color: (params.value as number) >= 3 ? "green" : "red" }}
        >
          {params.value as number} / 5
        </span>
      ),
    },
    {
      field: "comment",
      headerName: "Comment",
      flex: 2,
      minWidth: 200,
    },
    {
      field: "user",
      headerName: "User ID",
      flex: 1,
      minWidth: 150,
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      minWidth: 100,
      sortable: false,
      renderCell: (
        params: GridRenderCellParams, // ✅ typed params
      ) => (
        <button
          className="btn btn-danger py-1 px-2"
          onClick={() => deleteReviewHandler(params.row.id as string)}
        >
          <i className="fa fa-trash" />
        </button>
      ),
    },
  ];

  const rows = Array.isArray(reviews)
    ? reviews.map((review) => ({
        id: review._id,
        rating: review.rating,
        comment: review.comment,
        user: review.user,
      }))
    : [];

  return (
    <>
      <MetaData title="Product Reviews" />
      <div className="row">
        <div className="col-12 col-md-2">
          <Sidebar />
        </div>
        <div className="col-12 col-md-10">
          <div className="row justify-content-center mt-5">
            <div className="col-5">
              <form onSubmit={submitHandler}>
                <div className="form-group">
                  <label htmlFor="productId_field">Enter Product ID</label>
                  <input
                    type="text"
                    id="productId_field"
                    className="form-control"
                    value={productId}
                    onChange={(e) => setProductId(e.target.value)}
                    placeholder="Enter product ID..."
                  />
                </div>
                <button
                  id="search_button"
                  type="submit"
                  className="btn btn-primary btn-block py-2"
                  disabled={!productId.trim()}
                >
                  SEARCH
                </button>
              </form>
            </div>
          </div>

          {rows.length > 0 ? (
            <div style={{ width: "100%" }}>
              <h1 className="my-5">
                All Reviews
                <span className="ml-2 text-muted" style={{ fontSize: "1rem" }}>
                  ({rows.length} {rows.length === 1 ? "review" : "reviews"})
                </span>
              </h1>
              <DataGrid
                rows={rows}
                columns={columns}
                autoHeight
                pageSizeOptions={[5, 10, 25]}
                initialState={{
                  pagination: { paginationModel: { pageSize: 10 } },
                }}
                disableRowSelectionOnClick
                sx={{
                  "& .MuiDataGrid-row": { cursor: "pointer" },
                }}
              />
            </div>
          ) : (
            <p className="mt-5 text-center">
              {productId
                ? "No reviews found for this product."
                : "Search for a product to see its reviews."}
            </p>
          )}
        </div>
      </div>
    </>
  );
};

export default ProductReviews;
