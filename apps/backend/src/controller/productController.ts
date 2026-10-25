import cloudinary from "../config/cloudinary.js";
import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import type { Request, Response, NextFunction } from "express";
import { Product } from "../model/productModel.js";
import { APIFeatures } from "../util/apiFeatures.js";
import ErrorHandler from "../util/errorHandler.js";
import type { IProduct } from "../types/productTypes.js";

interface ImageLink {
  public_id: string;
  url: string;
}

// New Product
export const newProduct = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    let images: string[] = [];
    if (typeof req.body.images === "string") {
      images.push(req.body.images);
    } else {
      images = req.body.images as string[];
    }

    const imagesLinks: ImageLink[] = [];
    for (let i = 0; i < images.length; i++) {
      const result = await cloudinary.uploader.upload(images[i]!, {
        folder: "products",
      });
      imagesLinks.push({
        public_id: result.public_id,
        url: result.secure_url,
      });
    }

    req.body.images = imagesLinks;
    req.body.user = req.user!._id;
    const product = await Product.create(req.body);
    res.status(201).json({ success: true, product });
  },
);

// Get All Products
export const getProducts = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const resPerPage = Number(req.query.limit) || 2;
    const result = await new APIFeatures<IProduct>(
      Product.find(),
      req.query as Record<string, string>,
    )
      .search()
      .filter()
      .pagination(resPerPage)
      .execute();

    res.status(200).json({
      success: true,
      message: "Successfully fetched all products from DB.",
      products: result.data,
      ...result.pagination,
    });
  },
);

// Get Single Product
export const getSingleProduct = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return next(new ErrorHandler("Product not found", 404));
    }
    res.status(200).json({ success: true, product });
  },
);

// Update Product
export const updateProduct = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    let product = await Product.findById(req.params.id);
    if (!product) {
      return next(new ErrorHandler("Product not found", 404));
    }

    let images: string[] = [];
    if (typeof req.body.images === "string") {
      images.push(req.body.images);
    } else {
      images = req.body.images as string[];
    }

    if (images !== undefined) {
      // Delete old images
      for (let i = 0; i < product.images.length; i++) {
        await cloudinary.uploader.destroy(product.images[i]!.public_id);
      }
      // Upload new images
      const imagesLinks: ImageLink[] = [];
      for (let i = 0; i < images.length; i++) {
        const result = await cloudinary.uploader.upload(images[i]!, {
          folder: "products",
        });
        imagesLinks.push({
          public_id: result.public_id,
          url: result.secure_url,
        });
      }
      req.body.images = imagesLinks;
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({ success: true, product });
  },
);

// Delete Product
export const deleteProduct = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return next(new ErrorHandler("Product not found", 404));
    }

    for (let i = 0; i < product.images.length; i++) {
      await cloudinary.uploader.destroy(product.images[i]!.public_id);
    }

    await Product.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Product is deleted." });
  },
);

// Create/Update Review
export const createProductReview = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { rating, comment, productId } = req.body as {
      rating: number;
      comment: string;
      productId: string;
    };

    const review = {
      user: req.user!._id,
      name: req.user!.name,
      rating: Number(rating),
      comment,
    };

    const product = await Product.findById(productId);
    if (!product) {
      return next(new ErrorHandler("Product not found", 404));
    }

    const isReviewed = product.reviews.find(
      (r) => r.user.toString() === req.user!._id.toString(),
    );

    if (isReviewed) {
      product.reviews.forEach((review) => {
        if (review.user.toString() === req.user!._id.toString()) {
          review.comment = comment;
          review.rating = rating;
        }
      });
    } else {
      product.reviews.push(review);
      product.numOfReviews = product.reviews.length;
    }

    product.ratings =
      product.reviews.reduce((acc, item) => item.rating + acc, 0) /
      product.reviews.length;

    await product.save({ validateBeforeSave: false });
    res.status(200).json({ success: true });
  },
);

// Get Product Reviews
export const getProductReviews = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const product = await Product.findById(req.query.id as string);
    if (!product) {
      return next(new ErrorHandler("Product not found", 404));
    }
    res.status(200).json({ success: true, reviews: product.reviews });
  },
);

// Delete Review
export const deleteReview = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const product = await Product.findById(req.query.productId as string);
    if (!product) {
      return next(new ErrorHandler("Product not found", 404));
    }

    const reviews = product.reviews.filter(
      (review) => review._id!.toString() !== (req.query.id as string),
    );

    const numOfReviews = reviews.length;
    const ratings =
      reviews.reduce((acc, item) => item.rating + acc, 0) / numOfReviews || 0;

    await Product.findByIdAndUpdate(
      req.query.productId as string,
      { reviews, ratings, numOfReviews },
      { new: true, runValidators: true },
    );

    res.status(200).json({ success: true });
  },
);

// Get Admin Products
export const getAdminProducts = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const resPerPage = Number(req.query.resperpage) || 10;
    const result = await new APIFeatures<IProduct>(
      Product.find(),
      req.query as Record<string, string>,
    )
      .pagination(resPerPage)
      .execute();

    res.status(200).json({
      success: true,
      message: "Successfully fetched all products from DB.",
      admins: result.data,
      ...result.pagination,
    });
  },
);
