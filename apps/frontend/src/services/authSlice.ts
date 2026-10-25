import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import api from "../util/axios";
import type { IAuthState, IUser } from "../types/userTypes";

const initialState: IAuthState = {
  isAuthenticated: false,
  loading: false,
  error: null,
  user: null,
  allUser: [],
  totalUsers: null,
  userLoaded: false,
  usersLoading: false,
  isUpdated: false,
  isDeleted: false,
  fetchedUser: null,
};

// ========== LOGIN ==========
interface ILoginCredentials {
  email: string;
  password: string;
}
export const getAuth = createAsyncThunk<IUser, ILoginCredentials>(
  "auth/getAuth",
  async ({ email, password }: ILoginCredentials, { rejectWithValue }) => {
    try {
      const { data } = await api.post(
        `/login`,
        { email, password },
        {
          headers: { "Content-Type": "application/json" },
        },
      );
      return data.user as IUser;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Login failed",
      );
    }
  },
);

// ========== REGISTER ==========
export const createUser = createAsyncThunk<IUser, FormData>(
  "user/createUser",
  async (userData: FormData, { rejectWithValue }) => {
    try {
      const { data } = await api.post(`/register`, userData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data.user as IUser;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "User creation failed",
      );
    }
  },
);

// ========== LOAD USER ==========
export const loadUser = createAsyncThunk<IUser>(
  "user/loadUser",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/me`);
      return data.user as IUser;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "User load failed",
      );
    }
  },
);

// ========== LOGOUT ==========
export const logoutUser = createAsyncThunk(
  "user/logoutUser",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/logout`);
      return data;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Logout failed",
      );
    }
  },
);

// ========== ALL USERS - Admin ==========
interface IFetchAllUsers {
  resPerPage?: number;
  currentPage?: number;
}
interface IAllUsersResponse {
  users: IUser[];
  totalCount: number;
}
export const allUsers = createAsyncThunk<
  IAllUsersResponse,
  IFetchAllUsers | void
>("user/allUsers", async (params = {}, { rejectWithValue }) => {
  const { resPerPage = 5, currentPage = 1 }: IFetchAllUsers = params ?? {};
  try {
    const { data } = await api.get(
      `/admin/users?resperpage=${resPerPage}&page=${currentPage}`,
    );
    return data as IAllUsersResponse;
  } catch (error) {
    return rejectWithValue(
      error instanceof Error ? error.message : "Fetch all users failed",
    );
  }
});

// ========== UPDATE USER - Admin ==========
interface IUpdateUser {
  id: string;
  formData: Partial<IUser>; // Partial since you may not update all fields
}
export const updateUser = createAsyncThunk<boolean, IUpdateUser>(
  "user/updateUser",
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/admin/user/${id}`, formData, {
        headers: { "Content-Type": "application/json" },
      });
      return data.success as boolean;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Update user failed",
      );
    }
  },
);

// ========== GET USER - Admin ==========
export const getUser = createAsyncThunk<IUser, string>(
  "user/getUser",
  async (id: string, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/admin/user/${id}`);
      return data.user as IUser;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Get user failed",
      );
    }
  },
);

// ========== DELETE USER - Admin ==========
export const deleteUser = createAsyncThunk<boolean, string>(
  "user/deleteUser",
  async (id: string, { rejectWithValue }) => {
    try {
      const { data } = await api.delete(`/admin/user/${id}`);
      return data.success as boolean;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Delete user failed",
      );
    }
  },
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    updateUserReset: (state) => {
      state.isUpdated = false;
    },
    deleteUserReset: (state) => {
      state.isDeleted = false;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // ========== LOGIN ==========
      .addCase(getAuth.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAuth.fulfilled, (state, action: PayloadAction<IUser>) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
        state.error = null;
        state.userLoaded = true;
      })
      .addCase(getAuth.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.error = action.payload as string;
        state.userLoaded = false;
      })
      // ========== REGISTER ==========
      .addCase(createUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createUser.fulfilled, (state, action: PayloadAction<IUser>) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
        state.error = null;
        state.userLoaded = true;
      })
      .addCase(createUser.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.error = action.payload as string;
        state.userLoaded = false;
      })
      // ========== LOAD USER ==========
      .addCase(loadUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadUser.fulfilled, (state, action: PayloadAction<IUser>) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
        state.error = null;
        state.userLoaded = true;
      })
      .addCase(loadUser.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.error = action.payload as string;
        state.userLoaded = false;
      })
      // ========== LOGOUT ==========
      .addCase(logoutUser.fulfilled, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.error = null;
        state.userLoaded = false;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // ========== ALL USERS - Admin ==========
      .addCase(allUsers.pending, (state) => {
        state.usersLoading = true;
        state.error = null;
      })
      .addCase(
        allUsers.fulfilled,
        (state, action: PayloadAction<IAllUsersResponse>) => {
          state.usersLoading = false;
          state.error = null;
          state.allUser = action.payload.users;
          state.totalUsers = action.payload.totalCount;
        },
      )
      .addCase(allUsers.rejected, (state, action) => {
        state.usersLoading = false;
        state.error = action.payload as string;
      })
      // ========== UPDATE USER - Admin ==========
      .addCase(updateUser.pending, (state) => {
        state.usersLoading = true;
        state.isUpdated = false;
        state.error = null;
      })
      .addCase(
        updateUser.fulfilled,
        (state, action: PayloadAction<boolean>) => {
          state.usersLoading = false;
          state.error = null;
          state.isUpdated = action.payload;
        },
      )
      .addCase(updateUser.rejected, (state, action) => {
        state.usersLoading = false;
        state.error = action.payload as string;
        state.isUpdated = false;
      })
      // ========== GET USER - Admin ==========
      .addCase(getUser.pending, (state) => {
        state.usersLoading = true;
        state.error = null;
      })
      .addCase(getUser.fulfilled, (state, action: PayloadAction<IUser>) => {
        state.usersLoading = false;
        state.error = null;
        state.fetchedUser = action.payload;
      })
      .addCase(getUser.rejected, (state, action) => {
        state.usersLoading = false;
        state.error = action.payload as string;
        state.fetchedUser = null;
      })
      // ========== DELETE USER - Admin ==========
      .addCase(deleteUser.pending, (state) => {
        state.usersLoading = true;
        state.error = null;
        state.isDeleted = false;
      })
      .addCase(
        deleteUser.fulfilled,
        (state, action: PayloadAction<boolean>) => {
          state.usersLoading = false;
          state.error = null;
          state.isDeleted = action.payload;
        },
      )
      .addCase(deleteUser.rejected, (state, action) => {
        state.usersLoading = false;
        state.error = action.payload as string;
        state.isDeleted = false;
      });
  },
});

export const { clearError, updateUserReset, deleteUserReset, setLoading } =
  authSlice.actions;
export const authReducer = authSlice.reducer;
