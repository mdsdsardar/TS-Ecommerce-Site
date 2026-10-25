import type { Request, Response, NextFunction } from "express";
import Stripe from "stripe";
import { catchAsyncError } from "../middlewares/catchAsyncError.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Process Stripe Payments => /api/v1/payment/process
export const processPayment = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: req.body.amount as number,
      currency: "usd",
      metadata: { integration_check: "accept_a_payment" },
    });
    res.status(200).json({
      success: true,
      client_secret: paymentIntent.client_secret,
    });
  },
);

// Send Stripe API Key => /api/v1/stripeapi
export const sendStripeApi = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    res.status(200).json({
      stripeApiKey: process.env.STRIPE_API_KEY!,
    });
  },
);