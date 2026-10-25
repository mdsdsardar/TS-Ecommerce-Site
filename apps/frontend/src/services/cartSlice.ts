import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import api from "../util/axios";
import type {
  ICartItem,
  ICartState,
  IShippingInfo,
  IUpdateCartQuantity,
} from "../types/cartTypes";

// ========== LocalStorage Helpers ==========
const loadCartFromStorage = (): ICartItem[] => {
  try {
    const cartItems = localStorage.getItem("cartItems");
    return cartItems ? (JSON.parse(cartItems) as ICartItem[]) : [];
  } catch {
    return [];
  }
};

const loadShippingFromStorage = (): Partial<IShippingInfo> => {
  try {
    const shippingInfo = localStorage.getItem("shippingInfo");
    return shippingInfo ? (JSON.parse(shippingInfo) as IShippingInfo) : {};
  } catch {
    return {};
  }
};

const saveCartToStorage = (cartItems: ICartItem[]): void => {
  try {
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
  } catch {
    // fail silently
  }
};

const saveShippingToStorage = (shippingInfo: Partial<IShippingInfo>): void => {
  try {
    localStorage.setItem("shippingInfo", JSON.stringify(shippingInfo));
  } catch {
    // fail silently
  }
};

// ========== ADD TO CART ==========
interface IAddToCart {
  id: string;
  quantity: number;
}
export const addItemToCart = createAsyncThunk<ICartItem, IAddToCart>(
  "cart/addToCart",
  async ({ id, quantity }: IAddToCart, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/product/${id}`);
      return {
        product: data.product._id as string,
        name: data.product.name as string,
        price: data.product.price as number,
        image: data.product.images[0].url as string,
        stock: data.product.stock as number,
        quantity,
      };
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to add item to cart",
      );
    }
  },
);

// ========== CART SLICE ==========
const cartSlice = createSlice({
  name: "cart",
  initialState: {
    cartItems: loadCartFromStorage(),
    shippingInfo: loadShippingFromStorage(),
    loading: false,
    error: null,
  } as ICartState,
  reducers: {
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.cartItems = state.cartItems.filter(
        (item) => item.product !== action.payload,
      );
      saveCartToStorage(state.cartItems);
    },
    updateCartQuantity: (state, action: PayloadAction<IUpdateCartQuantity>) => {
      const { productId, quantity } = action.payload;
      const item = state.cartItems.find((i) => i.product === productId);
      if (item) {
        item.quantity = quantity;
        saveCartToStorage(state.cartItems);
      }
    },
    clearCart: (state) => {
      state.cartItems = [];
      localStorage.removeItem("cartItems");
    },
    saveShippingInfo: (state, action: PayloadAction<IShippingInfo>) => {
      state.shippingInfo = action.payload;
      saveShippingToStorage(action.payload);
    },
    clearShippingInfo: (state) => {
      state.shippingInfo = {};
      localStorage.removeItem("shippingInfo");
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(addItemToCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        addItemToCart.fulfilled,
        (state, action: PayloadAction<ICartItem>) => {
          state.loading = false;
          const item = action.payload;
          const existingItem = state.cartItems.find(
            (i) => i.product === item.product,
          );
          if (existingItem) {
            state.cartItems = state.cartItems.map((i) =>
              i.product === item.product ? item : i,
            );
          } else {
            state.cartItems.push(item);
          }
          saveCartToStorage(state.cartItems);
          state.error = null;
        },
      )
      .addCase(addItemToCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  updateCartQuantity,
  removeFromCart,
  clearCart,
  saveShippingInfo,
  clearShippingInfo,
  clearError,
} = cartSlice.actions;
export const cartReducer = cartSlice.reducer;
