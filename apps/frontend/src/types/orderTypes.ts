export interface IOrderItem {
  name: string;
  quantity: number;
  image: string;
  price: number;
  product: string;
}

export interface IShippingInfo {
  address: string;
  city: string;
  phoneNo: string;
  postalCode: string;
  country: string;
}

export interface IPaymentInfo {
  id: string;
  status: string;
}

export interface IUser {
  name: string;
}

export interface IOrder {
  _id?: string;
  orderItems: IOrderItem[];
  shippingInfo: IShippingInfo;
  itemPrice: number;
  taxPrice: number;
  shippingPrice: number;
  totalPrice: number;
  paymentInfo: IPaymentInfo;
  orderStatus?: string;
  paidAt?: string;
  deliveredAt?: string;
  user?: IUser;
}

export interface IOrderState {
  loading: boolean;
  error: string | null;
  order: IOrder | IOrder[] | null;
  allOrder: IOrder[];
  totalAmount: number;
  totalOrder: number;
  isUpdated: boolean;
  isDeleted: boolean;
}
