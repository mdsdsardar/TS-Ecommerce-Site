import express from "express";
import { isAuthenticatedUser, authorizedRole } from "../middlewares/auth.js";
import {
  createProductReview,
  deleteProduct,
  deleteReview,
  getAdminProducts,
  getProductReviews,
  getProducts,
  getSingleProduct,
  newProduct,
  updateProduct,
} from "../controller/productController.js";

const productRouter = express.Router();

productRouter
  .route("/product/new")
  .post(isAuthenticatedUser, authorizedRole("admin"), newProduct);
productRouter.route("/admin/products").get(getAdminProducts); //need to add isAuthenticatedUser, authorizedRole("admin") laters
productRouter.route("/products").get(getProducts); //need to add it later {isAuthenticatedUser}
productRouter.route("/product/:id").get(getSingleProduct);
productRouter
  .route("/product/update/:id")
  .put(isAuthenticatedUser, authorizedRole("admin"), updateProduct);
productRouter
  .route("/product/delete/:id")
  .delete(isAuthenticatedUser, authorizedRole("admin"), deleteProduct);
productRouter.route("/review").put(isAuthenticatedUser, createProductReview);
productRouter.route("/review").get(isAuthenticatedUser, getProductReviews);
productRouter.route("/review").delete(isAuthenticatedUser, deleteReview);

export default productRouter;
