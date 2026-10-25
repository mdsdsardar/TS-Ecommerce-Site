import {
  registerUser,
  loginUser,
  logOut,
  forgotPassword,
  resetPassword,
  getUserProfile,
  updatePassword,
  updateProfile,
  allUsers,
  getUserDetails,
  updateUserProfile,
  deleteUser,
} from "../controller/userController.js";
import express from "express";
import { authorizedRole, isAuthenticatedUser } from "../middlewares/auth.js";
const userRouter = express.Router();

userRouter.route("/register").post(registerUser);
userRouter.route("/login").post(loginUser);
userRouter.route("/password/forgot").post(forgotPassword);
userRouter.route("/password/reset/:token").put(resetPassword);
userRouter.route("/logout").get(logOut);
userRouter.route("/me").get(isAuthenticatedUser, getUserProfile);
userRouter.route("/password/update").put(isAuthenticatedUser, updatePassword);
userRouter.route("/me/update").put(isAuthenticatedUser, updateProfile);

userRouter
  .route("/admin/users")
  .get(isAuthenticatedUser, authorizedRole("admin"), allUsers);
userRouter
  .route("/admin/user/:id")
  .get(isAuthenticatedUser, authorizedRole("admin"), getUserDetails);
userRouter
  .route("/admin/user/:id")
  .put(isAuthenticatedUser, authorizedRole("admin"), updateUserProfile);
userRouter
  .route("/admin/user/:id")
  .delete(isAuthenticatedUser, authorizedRole("admin"), deleteUser);

export default userRouter;
