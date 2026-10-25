import type { Response, CookieOptions } from "express";
import type { IUser } from "../types/userTypes.js";

//create and send token and save it in cookie.
export const sendToken = (user: IUser, statusCode: number, res: Response) => {
  //create jwt token.
  const token = user.getJwtToken();

  //option for cookie.
  const options: CookieOptions = {
    expires: new Date(
      Date.now() +
        Number(process.env.COOKIE_EXPIRES_TIME) * 24 * 60 * 60 * 1000,
    ),
    httpOnly: true,
    sameSite: "lax",
    // secure: process.env.NODE_ENV === "production",
  };

  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    token,
    user,
  });
};
