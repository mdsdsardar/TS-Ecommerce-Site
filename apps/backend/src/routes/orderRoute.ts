import express from "express";
import { allOrders, deleteOrder, getSingleOrder, myOrders, newOrder, updateOrders } from "../controller/orderController.js";
import { authorizedRole, isAuthenticatedUser } from "../middlewares/auth.js";

const orderRouter = express.Router();

orderRouter.route("/order/new").post(isAuthenticatedUser, newOrder);
orderRouter.route("/orders/me").get(isAuthenticatedUser, myOrders);
orderRouter.route("/order/:id").get(isAuthenticatedUser, getSingleOrder);
orderRouter
  .route("/admin/orders")
  .get(isAuthenticatedUser, authorizedRole("admin"), allOrders);
orderRouter
  .route("/admin/orders/:id")
  .put(isAuthenticatedUser, authorizedRole("admin"), updateOrders);
orderRouter
  .route("/admin/orders/:id")
  .delete(isAuthenticatedUser, authorizedRole("admin"), deleteOrder);

export default orderRouter;
