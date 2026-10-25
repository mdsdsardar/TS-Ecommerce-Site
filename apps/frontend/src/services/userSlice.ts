import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import api from "../util/axios";
import type { IUserState } from "../types/userTypes";

const initialState: IUserState = {
  loading: false,
  error: null,
  isUpdated: false,
  message: null,
  success: false,
  users: [],
};

// ========== UPDATE USER ==========
interface IUserFormData {
  name: string;
  email: string;
  avatar?: string;
}
interface IUpdateUser {
  userData: FormData | IUserFormData;
}
export const updateUser = createAsyncThunk<boolean, IUpdateUser>(
  "user/updateUser",
  async ({ userData }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/me/update`, userData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data.success as boolean;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Update user failed",
      );
    }
  },
);

// ========== UPDATE PASSWORD ==========
interface IUpdatePassword {
  oldPassword: string;
  password: string;
  confirmPassword: string;
}
export const updatePassword = createAsyncThunk<boolean, IUpdatePassword>(
  "auth/updatePassword",
  async (passwords: IUpdatePassword, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/password/update`, passwords, {
        headers: { "Content-Type": "application/json" },
      });
      return data.success as boolean;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Update password failed",
      );
    }
  },
);

// ========== FORGOT PASSWORD ==========
export const forgotPassword = createAsyncThunk<string, string>(
  "auth/forgotPassword",
  async (email: string, { rejectWithValue }) => {
    try {
      const { data } = await api.post(
        `/password/forgot`,
        { email }, // ✅ wrap in object, not raw string
        { headers: { "Content-Type": "application/json" } },
      );
      return data.message as string;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Forgot password failed",
      );
    }
  },
);

// ========== RESET PASSWORD ==========
interface IResetPassword {
  token: string;
  password: string;
  confirmPassword: string;
}
export const resetPassword = createAsyncThunk<boolean, IResetPassword>(
  "auth/resetPassword",
  async ({ token, password, confirmPassword }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(
        `/password/reset/${token}`,
        { password, confirmPassword }, // ✅ wrap in object, not raw string
        { headers: { "Content-Type": "application/json" } },
      );
      return data.success as boolean;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Reset password failed",
      );
    }
  },
);

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    updateUserReset: (state) => {
      state.isUpdated = false;
    },
    resetSuccess: (state) => {
      state.success = false;
    },
    clearMessage: (state) => {
      state.message = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // ========== Update User ==========
      .addCase(updateUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.isUpdated = false;
      })
      .addCase(
        updateUser.fulfilled,
        (state, action: PayloadAction<boolean>) => {
          state.loading = false;
          state.error = null;
          state.isUpdated = action.payload;
        },
      )
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isUpdated = false;
      })
      // ========== Update Password ==========
      .addCase(updatePassword.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.isUpdated = false;
      })
      .addCase(
        updatePassword.fulfilled,
        (state, action: PayloadAction<boolean>) => {
          state.loading = false;
          state.error = null;
          state.isUpdated = action.payload;
        },
      )
      .addCase(updatePassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isUpdated = false;
      })
      // ========== Forgot Password ==========
      .addCase(forgotPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(
        forgotPassword.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.loading = false;
          state.message = action.payload;
          state.error = null;
        },
      )
      .addCase(forgotPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // ========== Reset Password ==========
      .addCase(resetPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(
        resetPassword.fulfilled,
        (state, action: PayloadAction<boolean>) => {
          state.loading = false;
          state.success = action.payload;
          state.error = null;
        },
      )
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, updateUserReset, resetSuccess, clearMessage } =
  userSlice.actions;
export const userReducer = userSlice.reducer;
