import express from "express";
import {
  processPayment,
  sendStripeApi,
} from "../controller/paymentController.js";
import { isAuthenticatedUser } from "../middlewares/auth.js";
const paymentRouter = express.Router();

paymentRouter
  .route("/payment/process")
  .post(isAuthenticatedUser, processPayment);
paymentRouter.route("/stripeapi").get(isAuthenticatedUser, sendStripeApi);

export default paymentRouter;
