import mongoose, { Document, Schema } from "mongoose";
import type { IProduct } from "../types/productTypes.js";

const productSchema = new Schema<IProduct>({
  name: {
    type: String,
    required: [true, "Please enter product name!"],
    trim: true,
    maxLength: [100, "Product name cannot exceed 100 character."],
  },
  price: {
    type: Number,
    required: [true, "Please enter product price!"],
    default: 0.0,
  },
  description: {
    type: String,
    required: [true, "Please enter product description!"],
  },
  ratings: {
    type: Number,
    default: 0,
  },
  images: [
    {
      public_id: { type: String, required: true },
      url: { type: String, required: true },
    },
  ],
  category: {
    type: String,
    required: [true, "Please select category for this product!"],
    enum: {
      values: [
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
      ],
      message: "Please select correct category for this product",
    },
  },
  seller: {
    type: String,
    required: [true, "Please enter product seller!"],
  },
  stock: {
    type: Number,
    required: [true, "Please enter product stock!"],
    maxLength: [5, "Product stock cannot exceed 5 digits!"],
  },
  numOfReviews: {
    type: Number,
    default: 0,
  },
  reviews: [
    {
      user: { type: mongoose.Schema.ObjectId, ref: "User", required: true },
      name: { type: String, required: true },
      rating: { type: Number, required: true },
      comment: { type: String, required: true },
    },
  ],
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const Product = mongoose.model<IProduct>("Product", productSchema);
