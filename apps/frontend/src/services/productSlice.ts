import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import api from "../util/axios";
import type {
  IProduct,
  IProductDetailsState,
  IProductState,
  IReview,
} from "../types/productTypes";

// ========== GET PRODUCTS ==========
interface IGetProductsParams {
  keyword?: string;
  currentPage?: number;
  price?: [number, number];
  category?: string;
  rating?: number;
}
interface IGetProductsResponse {
  products: IProduct[];
  productsCount: number;
  resPerPage: number;
}
export const getProducts = createAsyncThunk<
  IGetProductsResponse,
  IGetProductsParams
>(
  "getProducts",
  async (
    {
      keyword = "",
      currentPage = 1,
      price = [0, 10000],
      category,
      rating = 0,
    }: IGetProductsParams = {},
    { rejectWithValue },
  ) => {
    const maxRetries = 3;
    const baseDelay = 1000;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        let link = `/products?name=${keyword}&page=${currentPage}&price[lte]=${price[1]}&price[gte]=${price[0]}&ratings[gte]=${rating}`;
        if (category) {
          link += `&category=${category}`;
        }
        const { data } = await api.get(link);
        return data as IGetProductsResponse;
      } catch (error) {
        if (attempt === maxRetries) {
          return rejectWithValue(
            error instanceof Error ? error.message : "Failed to load products",
          );
        }
        const delay = baseDelay * Math.pow(2, attempt - 1);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
    return rejectWithValue("Failed to load products after retries");
  },
);

// ========== GET ADMIN PRODUCTS ==========
interface IGetAdminProductsResponse {
  admins: IProduct[];
  totalCount: number;
}
interface IGetAdminProductsParams {
  resPerPage?: number;
  currentPage?: number;
}
export const getAdminProducts = createAsyncThunk<
  IGetAdminProductsResponse,
  IGetAdminProductsParams | void
>("getAdminProducts", async (params = {}, { rejectWithValue }) => {
  const { resPerPage = 5, currentPage = 1 } = params ?? {};
  try {
    const { data } = await api.get(
      `/admin/products?resperpage=${resPerPage}&page=${currentPage}`,
    );
    return data as IGetAdminProductsResponse;
  } catch (error) {
    return rejectWithValue(
      error instanceof Error ? error.message : "Something went wrong",
    );
  }
});

// ========== GET PRODUCT DETAILS ==========
export const getProductDetails = createAsyncThunk<IProduct, string>(
  "getProductDetails",
  async (id: string, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/product/${id}`);
      return data.product as IProduct;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Something went wrong",
      );
    }
  },
);

// ========== NEW REVIEW ==========
export const newReview = createAsyncThunk<boolean, Partial<IReview>>(
  "review/newReview",
  async (reviewData: Partial<IReview>, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/review`, reviewData, {
        headers: { "Content-Type": "application/json" },
      });
      return data.success as boolean;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Something went wrong",
      );
    }
  },
);

// ========== NEW PRODUCT ==========
export const newProduct = createAsyncThunk<IProduct, FormData>(
  "product/newProduct",
  async (productData: FormData, { rejectWithValue }) => {
    try {
      const { data } = await api.post(`/product/new`, productData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data.product as IProduct;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Something went wrong",
      );
    }
  },
);

// ========== UPDATE PRODUCT ==========
interface IUpdateProduct {
  id: string;
  productData: FormData;
}
export const updateProduct = createAsyncThunk<boolean, IUpdateProduct>(
  "product/updateProduct",
  async ({ id, productData }: IUpdateProduct, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/product/update/${id}`, productData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data.success as boolean;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Something went wrong",
      );
    }
  },
);

// ========== DELETE PRODUCT ==========
export const deleteProduct = createAsyncThunk<boolean, string>(
  "product/deleteProduct",
  async (id: string, { rejectWithValue }) => {
    try {
      const { data } = await api.delete(`/product/delete/${id}`);
      return data.success as boolean;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Something went wrong",
      );
    }
  },
);

// ========== PRODUCT REVIEWS ==========
export const productReviews = createAsyncThunk<IReview[], string>(
  "product/productReviews",
  async (id: string, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/review?id=${id}`);
      return data.reviews as IReview[];
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Something went wrong",
      );
    }
  },
);

// ========== DELETE REVIEW ==========
interface IDeleteReview {
  productId: string;
  id: string;
}
export const deleteReview = createAsyncThunk<boolean, IDeleteReview>(
  "product/deleteReview",
  async ({ productId, id }: IDeleteReview, { rejectWithValue }) => {
    try {
      const { data } = await api.delete(
        `/reviews?productId=${productId}&id=${id}`,
      );
      return data.success as boolean;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Something went wrong",
      );
    }
  },
);

// ========== PRODUCT LIST SLICE ==========
const productSlice = createSlice({
  name: "products",
  initialState: {
    products: [],
    loading: false,
    error: null,
    productsCount: 0,
    resPerPage: 0,
    totalProducts: 0,
  } as IProductState,
  reducers: {
    clearErrors: (state) => {
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        getProducts.fulfilled,
        (state, action: PayloadAction<IGetProductsResponse>) => {
          state.loading = false;
          state.products = action.payload.products;
          state.productsCount = action.payload.productsCount;
          state.resPerPage = action.payload.resPerPage;
          state.error = null;
        },
      )
      .addCase(getProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(getAdminProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        getAdminProducts.fulfilled,
        (state, action: PayloadAction<IGetAdminProductsResponse>) => {
          state.loading = false;
          state.products = action.payload.admins;
          state.totalProducts = action.payload.totalCount;
          state.error = null;
        },
      )
      .addCase(getAdminProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

// ========== PRODUCT DETAILS SLICE ==========
const productDetailsSlice = createSlice({
  name: "productDetails", // ✅ fixed: was "products" causing slice name conflict
  initialState: {
    productDetails: null,
    loading: false,
    error: null,
    success: false,
    isDeleted: false,
    isUpdated: false,
    reviews: [],
  } as IProductDetailsState,
  reducers: {
    resetReview: (state) => {
      state.success = false;
    },
    resetDeleteProduct: (state) => {
      state.isDeleted = false;
    },
    resetUpdateProduct: (state) => {
      state.isUpdated = false;
    },
    clearErrors: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getProductDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        getProductDetails.fulfilled,
        (state, action: PayloadAction<IProduct>) => {
          state.loading = false;
          state.productDetails = action.payload;
          state.error = null;
        },
      )
      .addCase(getProductDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(newReview.pending, (state) => {
        state.loading = true;
        state.success = false;
      })
      .addCase(newReview.fulfilled, (state, action: PayloadAction<boolean>) => {
        state.loading = false;
        state.success = action.payload;
        state.error = null;
      })
      .addCase(newReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.success = false;
      })
      .addCase(newProduct.pending, (state) => {
        state.loading = true;
        state.success = false;
      })
      .addCase(
        newProduct.fulfilled,
        (state, action: PayloadAction<IProduct>) => {
          state.loading = false;
          state.productDetails = action.payload;
          state.success = true;
          state.error = null;
        },
      )
      .addCase(newProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(deleteProduct.pending, (state) => {
        state.loading = true;
        state.isDeleted = false;
      })
      .addCase(
        deleteProduct.fulfilled,
        (state, action: PayloadAction<boolean>) => {
          state.loading = false;
          state.isDeleted = action.payload;
          state.error = null;
        },
      )
      .addCase(deleteProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateProduct.pending, (state) => {
        state.loading = true;
        state.isUpdated = false;
      })
      .addCase(
        updateProduct.fulfilled,
        (state, action: PayloadAction<boolean>) => {
          state.loading = false;
          state.isUpdated = action.payload;
          state.error = null;
        },
      )
      .addCase(updateProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isUpdated = false;
      })
      .addCase(productReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        productReviews.fulfilled,
        (state, action: PayloadAction<IReview[]>) => {
          state.loading = false;
          state.reviews = action.payload;
          state.error = null;
        },
      )
      .addCase(productReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(deleteReview.pending, (state) => {
        state.loading = true;
        state.isDeleted = false;
      })
      .addCase(
        deleteReview.fulfilled,
        (state, action: PayloadAction<boolean>) => {
          state.loading = false;
          state.isDeleted = action.payload;
          state.error = null;
        },
      )
      .addCase(deleteReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isDeleted = false;
      });
  },
});

// ========== Exports ==========
export const { setLoading, clearErrors: clearProductErrors } =
  productSlice.actions;
export const productReducer = productSlice.reducer;

export const {
  resetDeleteProduct,
  resetUpdateProduct,
  resetReview,
  clearErrors: clearProductDetailsErrors,
} = productDetailsSlice.actions;
export const productDetailsReducer = productDetailsSlice.reducer;
