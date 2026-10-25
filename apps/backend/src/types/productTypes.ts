import type { Types, Document } from "mongoose";

interface IReview {
  user: Types.ObjectId;
  name: string;
  rating: number;
  comment: string;
  _id?: Types.ObjectId;
}

interface IImage {
  public_id: string;
  url: string;
}

//IProduct extends Document — gives you Mongoose document methods like .save(), .populate() etc. with full type safety
export interface IProduct extends Document {
  name: string;
  price: number;
  description: string;
  ratings: number;
  images: IImage[];
  category: string;
  seller: string;
  stock: number;
  numOfReviews: number;
  reviews: IReview[];
  user: Types.ObjectId;
  createdAt: Date;
}
