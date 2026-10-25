import type { Request, Response, NextFunction } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import ErrorHandler from "../util/errorHandler.js";
import { catchAsyncError } from "./catchAsyncError.js";
import { User } from "../model/userModel.js";
import type { IUser } from "../types/userTypes.js";

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

export const isAuthenticatedUser = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { token } = req.cookies as { token: string | undefined };
    if (!token) {
      return next(
        new ErrorHandler("Login first to access this resource.", 401),
      );
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    req.user = (await User.findById(decoded.id))!;
    next();
  },
);

export const authorizedRole = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user!.role)) {
      return next(
        new ErrorHandler(
          `Role (${req.user!.role}) is not allowed to access this resource.`,
          403,
        ),
      );
    }
    next();
  };
};
