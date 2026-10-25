import mongoose, { Document, Schema } from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import type { IUser } from "../types/userTypes.js";

const userSchema = new Schema<IUser>({
  name: {
    type: String,
    required: [true, "Please enter your name!"],
    trim: true,
    maxLength: [30, "Your name cannot exceed 30 character."],
  },
  email: {
    type: String,
    required: [true, "Please enter your email!"],
    unique: true,
    validate: [validator.isEmail, "Please enter valid email address"],
  },
  password: {
    type: String,
    required: [true, "Please enter your Password!"],
    minlength: [6, "Your password must be longer than 6 character"],
    select: false,
  },
  avatar: {
    public_id: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
  },
  role: {
    type: String,
    default: "user",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
});

//Encrypting Password before saving it.
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return; //next(); never mix async with next.
  }
  this.password = await bcrypt.hash(this.password, 10);
});

//Compare user password.
userSchema.methods.comparePassword = async function (enteredPassword: string) {
  return await bcrypt.compare(enteredPassword, this.password);
};

//Return JWT token,
userSchema.methods.getJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET!, {
    expiresIn:
      (process.env.JWT_EXPIRES_TIME as jwt.SignOptions["expiresIn"]) ?? "7d",
  });
};

//Generate password reset token.
userSchema.methods.getResetPasswordToken = function () {
  //Generate token.
  const resetToken = crypto.randomBytes(20).toString("hex");

  //hash and set to resetPasswordToken.
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  //Set token expire time.
  this.resetPasswordExpire = Date.now() + 30 * 60 * 1000;
  return resetToken;
};

export const User = mongoose.model<IUser>("User", userSchema);
