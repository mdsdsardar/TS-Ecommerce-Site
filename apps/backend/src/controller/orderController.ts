import type { Request, Response, NextFunction } from "express";
import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import { Product } from "../model/productModel.js";
import ErrorHandler from "../util/errorHandler.js";
import { Order } from "../model/orderModel.js";
import { APIFeatures } from "../util/apiFeatures.js";
import type { IOrder } from "../types/orderTypes.js";

// Create new order => /api/v1/order/now
export const newOrder = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const {
      orderItems,
      shippingInfo,
      itemPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      paymentInfo,
    } = req.body as {
      orderItems: { product: string; quantity: number }[];
      shippingInfo: object;
      itemPrice: number;
      taxPrice: number;
      shippingPrice: number;
      totalPrice: number;
      paymentInfo: object;
    };

    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      if (!product) {
        return next(new ErrorHandler("Product not found", 404));
      }
      if (product.stock < item.quantity) {
        return next(
          new ErrorHandler(
            `Insufficient stock for ${product.name}. Only ${product.stock} available`,
            400,
          ),
        );
      }
      product.stock -= item.quantity;
      await product.save({ validateBeforeSave: false });
    }

    const order = await Order.create({
      orderItems,
      shippingInfo,
      itemPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      paymentInfo,
      paidAt: Date.now(),
      user: req.user!._id,
    });

    res.status(201).json({ success: true, order });
  },
);

// Get Single Order => /api/v1/order/:id
export const getSingleOrder = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const order = await Order.findById(req.params.id).populate(
      "user",
      "name email",
    );
    if (!order) {
      return next(new ErrorHandler("No Order found with this ID", 404));
    }
    res.status(200).json({ success: true, order });
  },
);

// Get Logged In User Orders => /api/v1/order/me
export const myOrders = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const orders = await Order.find({ user: req.user!._id });
    res.status(200).json({ success: true, orders });
  },
);

// Get All Orders - Admin => /api/v1/admin/orders
export const allOrders = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const resPerPage = Number(req.query.resperpage) || 5;
    const result = await new APIFeatures<IOrder>(
      Order.find(),
      req.query as Record<string, string>,
    )
      .pagination(resPerPage)
      .execute();

    const totalAmount = result.data.reduce(
      (acc, order) => acc + order.totalPrice,
      0,
    );

    res.status(200).json({
      success: true,
      totalAmount,
      orders: result.data,
      ...result.pagination,
    });
  },
);

// Update Order - Admin => /api/v1/admin/order/:id
export const updateOrders = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return next(new ErrorHandler("No Order found with this ID", 404));
    }
    if (order.orderStatus === "Delivered") {
      return next(
        new ErrorHandler("You have already delivered this order", 400),
      );
    }

    order.orderStatus = req.body.orderStatus as string;
    order.deliveredAt = new Date();
    await order.save();

    res.status(200).json({ success: true, order });
  },
);

// Delete Order => /api/v1/admin/order/:id
export const deleteOrder = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) {
      return next(new ErrorHandler("No Order found with this ID", 404));
    }
    res.status(200).json({ success: true });
  },
);
