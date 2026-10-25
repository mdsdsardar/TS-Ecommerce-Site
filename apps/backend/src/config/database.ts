// const mongoose = require("mongoose");
import mongoose from "mongoose";

const connectToDatabase = async () => {
  try {
    await mongoose.connect(
      process.env.DB_LOCAL_URL || "mongodb://localhost:27017/shopITTS",
    );
    console.log("DB Connected Successfully.");
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.log("DB Connection Failed:", error.message);
      process.exit(1); // 🔥 stop process
    } else {
      console.log("DB Connection Failed:", String(error));
      process.exit(1); // 🔥 stop process
    }
  }
};
connectToDatabase();
