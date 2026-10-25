import type { Request, Response, NextFunction } from "express";
import ErrorHandler from "../util/errorHandler.js";

interface CustomError extends Error {
  statusCode?: number;
  errors?: Record<string, { message: string }>;
  path?: string;
  code?: number;
  keyValue?: Record<string, string>;
}

export const notFoundErr = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  return next(new ErrorHandler(`Not Found - ${req.originalUrl}`, 404));
};

export const globalErrHandler = (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  err.statusCode = err.statusCode || 500;
  if (process.env.NODE_ENV === "DEVELOPMENT") {
    res.status(err.statusCode).json({
      success: false,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  } else {
    let error: CustomError = { ...err };
    error.message = err.message;
    // Mongoose validation error
    if (err.name === "ValidationError") {
      //! (non-null assertion) on err.errors! tells TS "I know this exists at this point"
      const message = Object.values(err.errors!)
        .map((val) => val.message)
        .join(", ");
      error = new ErrorHandler(message, 400);
    }
    //wrong Mongoose Object ID Error.
    if (err.name === "CastError") {
      const message = `Resource not found. Invalid: ${err.path}`;
      error = new ErrorHandler(message, 400);
    }
    //Mongoose Duplicate key Error
    if (err.code === 11000) {
      const message = `Duplicate ${Object.keys(err.keyValue!)} entered`;
      error = new ErrorHandler(message, 400);
    }
    //Wrong JWT Error
    if (err.name === "JsonWebTokenError") {
      const message = "JSON Web Token is invalid. Try Again!!!";
      error = new ErrorHandler(message, 400);
    }
    //Expired JWT Error
    if (err.name === "TokenExpiredError") {
      const message = "JSON Web Token is Expired. Try Again!!!";
      error = new ErrorHandler(message, 400);
    }

    res.status(error.statusCode!).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};
