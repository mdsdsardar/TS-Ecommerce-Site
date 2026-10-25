// ========== Interfaces ==========
interface IImage {
  public_id: string;
  url: string;
}

export interface IReview {
  _id: string;
  user: string;
  name: string;
  rating: number;
  comment: string;
}

export interface IProduct {
  _id: string;
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
}

// ========== Product List State ==========
export interface IProductState {
  products: IProduct[];
  loading: boolean;
  error: string | null;
  productsCount: number;
  resPerPage: number;
  totalProducts: number;
}

// ========== Product Details State ==========
export interface IProductDetailsState {
  productDetails: IProduct | null;
  loading: boolean;
  error: string | null;
  success: boolean;
  isDeleted: boolean;
  isUpdated: boolean;
  reviews: IReview[];
}
