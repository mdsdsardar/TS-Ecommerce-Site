import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import api from "../util/axios";
import type { IOrder, IOrderState } from "../types/orderTypes";

const initialState: IOrderState = {
  loading: false,
  error: null,
  order: null,
  allOrder: [],
  totalAmount: 0,
  totalOrder: 0,
  isUpdated: false,
  isDeleted: false,
};

// ========== CREATE ORDER ==========
export const createOrder = createAsyncThunk<boolean, IOrder>(
  "order/newOrder",
  async (order: IOrder, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/order/new", order, {
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

// ========== MY ORDERS ==========
export const myOrder = createAsyncThunk<IOrder[]>(
  "order/myOrder",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/orders/me");
      return data.orders as IOrder[];
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Something went wrong",
      );
    }
  },
);

// ========== ORDER DETAILS ==========
export const orderDetails = createAsyncThunk<IOrder, string>(
  "order/orderDetails",
  async (id: string, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/order/${id}`);
      return data.order as IOrder;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Something went wrong",
      );
    }
  },
);

// ========== ALL ORDERS - Admin ==========
interface IAllOrdersResponse {
  orders: IOrder[];
  totalAmount: number;
  totalCount: number;
}
interface IFetchAllOrders {
  resPerPage?: number;
  currentPage?: number;
}
export const allOrders = createAsyncThunk<
  IAllOrdersResponse,
  IFetchAllOrders | void
>("order/allOrders", async (params = {}, { rejectWithValue }) => {
  const { resPerPage = 5, currentPage = 1 } = params ?? {};
  try {
    const { data } = await api.get(
      `/admin/orders?resperpage=${resPerPage}&page=${currentPage}`,
    );
    return data as IAllOrdersResponse;
  } catch (error) {
    return rejectWithValue(
      error instanceof Error ? error.message : "Something went wrong",
    );
  }
});

// ========== UPDATE ORDER - Admin ==========
interface IUpdateOrder {
  id: string;
  orderData: { orderStatus: string };
}
export const updateOrder = createAsyncThunk<boolean, IUpdateOrder>(
  "order/updateOrder",
  async ({ id, orderData }: IUpdateOrder, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/admin/orders/${id}`, orderData, {
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

// ========== DELETE ORDER - Admin ==========
export const deleteOrder = createAsyncThunk<boolean, string>(
  "order/deleteOrder",
  async (id: string, { rejectWithValue }) => {
    try {
      const { data } = await api.delete(`/admin/orders/${id}`);
      return data.success as boolean;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Something went wrong",
      );
    }
  },
);

const orderSlice = createSlice({
  name: "order",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    updateOrderReset: (state) => {
      state.isUpdated = false;
    },
    deleteOrderReset: (state) => {
      state.isDeleted = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // ========== Create Order ==========
      .addCase(createOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // ========== My Orders ==========
      .addCase(myOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(myOrder.fulfilled, (state, action: PayloadAction<IOrder[]>) => {
        state.loading = false;
        state.order = action.payload;
        state.error = null;
      })
      .addCase(myOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // ========== Order Details ==========
      .addCase(orderDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        orderDetails.fulfilled,
        (state, action: PayloadAction<IOrder>) => {
          state.loading = false;
          state.order = action.payload;
          state.error = null;
        },
      )
      .addCase(orderDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // ========== All Orders - Admin ==========
      .addCase(allOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        allOrders.fulfilled,
        (state, action: PayloadAction<IAllOrdersResponse>) => {
          state.loading = false;
          state.allOrder = action.payload.orders;
          state.totalAmount = action.payload.totalAmount;
          state.totalOrder = action.payload.totalCount;
          state.error = null;
        },
      )
      .addCase(allOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // ========== Update Order - Admin ==========
      .addCase(updateOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.isUpdated = false;
      })
      .addCase(
        updateOrder.fulfilled,
        (state, action: PayloadAction<boolean>) => {
          state.loading = false;
          state.isUpdated = action.payload;
          state.error = null;
        },
      )
      .addCase(updateOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isUpdated = false;
      })
      // ========== Delete Order - Admin ==========
      .addCase(deleteOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.isDeleted = false;
      })
      .addCase(
        deleteOrder.fulfilled,
        (state, action: PayloadAction<boolean>) => {
          state.loading = false;
          state.isDeleted = action.payload;
          state.error = null;
        },
      )
      .addCase(deleteOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isDeleted = false;
      });
  },
});

export const { clearError, deleteOrderReset, updateOrderReset } =
  orderSlice.actions;
export const orderReducer = orderSlice.reducer;
