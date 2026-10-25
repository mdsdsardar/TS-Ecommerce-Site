export interface ICartItem {
  product: string;
  name: string;
  price: number;
  image: string;
  stock: number;
  quantity: number;
}

export interface IShippingInfo {
  address: string;
  city: string;
  phoneNo: string;
  postalCode: string;
  country: string;
}

export interface ICartState {
  cartItems: ICartItem[];
  shippingInfo: Partial<IShippingInfo>;
  loading: boolean;
  error: string | null;
}

export interface IUpdateCartQuantity {
  productId: string;
  quantity: number;
}

