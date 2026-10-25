import { Fragment, useState, useEffect } from "react";
import {
  getProducts,
  clearProductErrors,
  setLoading,
} from "../services/productSlice";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import MetaData from "./layout/MetaData";
import { useDispatch, useSelector } from "react-redux";
import Product from "./product/Product";
import Loader from "./layout/Loader";
import toast from "react-hot-toast";
// import ReactPaginate from "react-paginate";
import Pagination from "@mui/material/Pagination";
import { useParams } from "react-router-dom";
import type { RootState, AppDispatch } from "../store/store";

const categories: string[] = [
  "Electronics",
  "Cameras",
  "Laptop",
  "Accessories",
  "Headphones",
  "Food",
  "Books",
  "Clothes/Shoes",
  "Sports",
  "Beauty/Health",
  "Outdoor",
  "Home",
];

const Home = () => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [price, setPrice] = useState<[number, number]>([1, 1000]);
  const [category, setCategory] = useState<string>("");
  const [rating, setRating] = useState<number>(0);

  const { keyword } = useParams<{ keyword?: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const { products, loading, error, productsCount, resPerPage } = useSelector(
    (state: RootState) => state.products,
  );

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearProductErrors());
      return;
    }
    dispatch(setLoading(true));
    dispatch(getProducts({ keyword, currentPage, price, category, rating }));
  }, [dispatch, error, keyword, currentPage, price, category, rating]);

  const itemsPerPage = resPerPage || 10;
  const totalItems = productsCount || 0;
  const pageCount = itemsPerPage > 0 ? Math.ceil(totalItems / itemsPerPage) : 0;
  // const safeForcePage =
  //   pageCount > 0 && currentPage > 0
  //     ? Math.min(currentPage - 1, pageCount - 1)
  //     : undefined;
  return (
    <Fragment>
      {loading ? (
        <Loader />
      ) : (
        <Fragment>
          <MetaData title={"Buy Best Product Online"} />
          <h1 id="products_heading">Latest Products</h1>

          <section id="products" className="container mt-5">
            <div className="row">
              {keyword ? (
                <Fragment>
                  <div className="col-6 col-md-3 mt-5 mb-5">
                    <div className="px-5">
                      <Slider
                        range
                        min={1}
                        max={1000}
                        marks={{ 1: "$1", 1000: "$1000" }}
                        value={price}
                        onChange={(value) =>
                          setPrice(value as [number, number])
                        }
                      />
                      <hr className="my-5" />
                      <div className="mt-5">
                        <h4 className="mb-5">Categories</h4>
                        <ul className="pl-0">
                          {categories.map((cat) => (
                            <li
                              style={{
                                cursor: "pointer",
                                listStyleType: "none",
                              }}
                              key={cat}
                              onClick={() => setCategory(cat)}
                            >
                              {cat}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <hr className="my-3" />
                      <div className="mt-5">
                        <h4 className="mb-5">Ratings</h4>
                        <ul className="pl-0">
                          {[5, 4, 3, 2, 1].map((star) => (
                            <li
                              style={{
                                cursor: "pointer",
                                listStyleType: "none",
                              }}
                              key={star}
                              onClick={() => setRating(star)}
                            >
                              <div className="rating-outer">
                                <div
                                  className="rating-inner"
                                  style={{ width: `${star * 20}%` }}
                                />
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div className="col-6 col-md-9">
                    <div className="row">
                      {products?.map((product) => (
                        <Product key={product._id} product={product} col={4} />
                      ))}
                    </div>
                  </div>
                </Fragment>
              ) : (
                products?.map((product) => (
                  <Product key={product._id} product={product} col={3} />
                ))
              )}
            </div>
          </section>

          {resPerPage <= productsCount && (
            <div className="d-flex justify-content-center mt-5">
              <Pagination
                count={pageCount}
                page={currentPage}
                onChange={(_, page) => setCurrentPage(page)}
                color="primary"
                shape="rounded"
                showFirstButton
                showLastButton
              />
            </div>
          )}
        </Fragment>
      )}
    </Fragment>
  );
};

export default Home;
