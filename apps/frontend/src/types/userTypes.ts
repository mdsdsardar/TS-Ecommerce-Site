export interface IUser {
  _id: string;
  name: string;
  email: string;
  role: string;
  avatar: {
    public_id: string;
    url: string;
  };
  createdAt: string;
}

export interface IAuthState {
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  user: IUser | null;
  totalUsers: number | null;
  fetchedUser: IUser | null;
  allUser: IUser[];
  userLoaded: boolean;
  usersLoading: boolean;
  isUpdated: boolean;
  isDeleted: boolean;
}

export interface IUserState {
  loading: boolean;
  error: string | null;
  isUpdated: boolean;
  message: string | null;
  success: boolean;
  users: IUser[];
}
