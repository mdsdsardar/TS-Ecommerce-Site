import type { Types, Document } from "mongoose";

interface IShippingInfo {
  address: string;
  city: string;
  phoneNo: string;
  postalCode: string;
  country: string;
}

interface IOrderItems {
  name: string;
  quantity: number;
  image: string;
  price: number;
  product: Types.ObjectId;
}

interface IPaymentInfo {
  id: string;
  status: string;
}

export interface IOrder extends Document {
  shippingInfo: IShippingInfo;
  user: Types.ObjectId;
  orderItems: IOrderItems[];
  paymentInfo: IPaymentInfo;
  paidAt: Date;
  itemPrice: number;
  taxPrice: number;
  shippingPrice: number;
  totalPrice: number;
  orderStatus: string;
  deliveredAt: Date;
  createdAt: Date;
}
