import type { Document } from "mongoose";

interface Iavatar {
  public_id: string;
  url: string;
}

export interface IUser extends Document {
  // _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  password: string;
  avatar: Iavatar;
  role: string;
  createdAt: Date;
  resetPasswordToken: string | undefined;
  resetPasswordExpire: Date | undefined;
  //methods
  comparePassword(enteredPassword: string): Promise<boolean>;
  getJwtToken(): string;
  getResetPasswordToken(): string;
}
