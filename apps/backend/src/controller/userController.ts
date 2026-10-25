import crypto from "crypto";
import type { Request, Response, NextFunction } from "express";
import cloudinary from "../config/cloudinary.js";
import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import { User } from "../model/userModel.js";
import { APIFeatures } from "../util/apiFeatures.js";
import ErrorHandler from "../util/errorHandler.js";
import { sendToken } from "../util/jwtToken.js";
import { sendEmail } from "../util/sendEmail.js";
import type { IUser } from "../types/userTypes.js";

interface NewUserData {
  name: string;
  email: string;
  role?: string;
  avatar?: {
    public_id: string;
    url: string;
  };
}

// Register User
export const registerUser = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, email, password } = req.body as {
      name: string;
      email: string;
      password: string;
    };

    if (!name || !email || !password) {
      return next(new ErrorHandler("Please enter name, email & password", 400));
    }

    const userFound = await User.findOne({ email });
    if (userFound) {
      return next(new ErrorHandler("Email Already exists", 401));
    }

    const result = await cloudinary.uploader.upload(req.body.avatar, {
      folder: "avatars",
      width: 150,
      crop: "scale",
    });
    console.log(result);

    const user = await User.create({
      name,
      email,
      password,
      avatar: {
        public_id: result.public_id,
        url: result.secure_url,
      },
    });

    sendToken(user, 200, res);
  },
);

// Login User
export const loginUser = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body as { email: string; password: string };

    if (!email || !password) {
      return next(new ErrorHandler("Please enter email & password", 400));
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return next(new ErrorHandler("Invalid Email or Password", 401));
    }

    const isPasswordMatched = await user.comparePassword(password);
    if (!isPasswordMatched) {
      return next(new ErrorHandler("Invalid Email or Password", 401));
    }

    sendToken(user, 200, res);
  },
);

// Forgot Password => /api/v1/password/forgot
export const forgotPassword = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = await User.findOne({ email: req.body.email as string });
    if (!user) {
      return next(new ErrorHandler("User not found with this email", 404));
    }

    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${req.protocol}://${req.get("host")}/password/reset/${resetToken}`;
    const message = `Your password reset token is as follow:\n\n${resetUrl}\n\nIf you have not requested this email, then ignore it.`;

    try {
      await sendEmail({
        email: user.email,
        subject: "ShopIT Password Recovery",
        message,
      });
      res.status(200).json({
        success: true,
        message: `Email sent to: ${user.email}`,
      });
    } catch (error: unknown) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });
      const message =
        error instanceof Error ? error.message : "Email could not be sent";
      return next(new ErrorHandler(message, 500));
    }
  },
);

// Reset Password => /api/v1/password/reset
export const resetPassword = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const token = req.params.token;

    if (!token || typeof token !== "string") {
      return next(new Error("Invalid token"));
    }

    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return next(
        new ErrorHandler("Password reset token is invalid or has expired", 400),
      );
    }

    if (req.body.password !== req.body.confirmPassword) {
      return next(new ErrorHandler("Passwords do not match", 400));
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    sendToken(user, 200, res);
  },
);

// Get Current User => /api/v1/me
export const getUserProfile = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = await User.findById(req.user!._id);
    res.status(200).json({ success: true, user });
  },
);

// Update Password => /api/v1/password/update
export const updatePassword = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = await User.findById(req.user!._id).select("+password");
    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }

    const isMatched = await user.comparePassword(
      req.body.oldPassword as string,
    );
    if (!isMatched) {
      return next(new ErrorHandler("Old password is incorrect", 400));
    }

    user.password = req.body.password;
    await user.save();
    sendToken(user, 200, res);
  },
);

// Update Profile => /api/v1/me/update
export const updateProfile = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const newUserData: NewUserData = {
      name: req.body.name,
      email: req.body.email,
    };

    if (req.body.avatar !== "") {
      const user = await User.findById(req.user!._id);
      if (user) {
        await cloudinary.uploader.destroy(user.avatar.public_id);
        const result = await cloudinary.uploader.upload(req.body.avatar, {
          folder: "avatars",
          width: 150,
          crop: "scale",
        });
        newUserData.avatar = {
          public_id: result.public_id,
          url: result.secure_url,
        };
      }
    }

    const user = await User.findByIdAndUpdate(req.user!._id, newUserData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, user });
  },
);

// Logout => /api/v1/logout
export const logOut = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    res.cookie("token", null, {
      expires: new Date(Date.now()),
      httpOnly: true,
      sameSite: "lax",
    });
    res.status(200).json({ success: true, message: "Logged Out" });
  },
);

// Admin - Get All Users => /api/v1/admin/users
export const allUsers = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const resPerPage = Number(req.query.resperpage) || 10;
    const result = await new APIFeatures<IUser>(
      User.find(),
      req.query as Record<string, string>,
    )
      .pagination(resPerPage)
      .execute();

    res.status(200).json({
      success: true,
      users: result.data,
      ...result.pagination,
    });
  },
);

// Admin - Get User Details => /api/v1/admin/user/:id
export const getUserDetails = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = await User.findById(req.params.id);
    if (!user) {
      return next(
        new ErrorHandler(`User not found with id: ${req.params.id}`, 404),
      );
    }
    res.status(200).json({ success: true, user });
  },
);

// Admin - Update User => /api/v1/admin/user/:id
export const updateUserProfile = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const newUserData: NewUserData = {
      name: req.body.name as string,
      email: req.body.email as string,
      role: req.body.role as string,
    };

    const user = await User.findByIdAndUpdate(req.params.id, newUserData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, user });
  },
);

// Admin - Delete User => /api/v1/admin/user/:id
export const deleteUser = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = await User.findById(req.params.id);
    if (!user) {
      return next(
        new ErrorHandler(`User not found with id: ${req.params.id}`, 404),
      );
    }

    await cloudinary.uploader.destroy(user.avatar.public_id);
    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true });
  },
);
