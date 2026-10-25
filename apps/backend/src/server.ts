// 1️⃣ Handle uncaught exceptions FIRST
process.on("uncaughtException", (err: Error) => {
  console.error(`Error: ${err.stack}`);
  console.log("Shutting down the server due to Uncaught Exceptions");
  process.exit(1);
});

import "./config/env.js";
import "./config/cloudinary.js";

// 3️⃣ App & DB
import app from "./app.js";
import "./config/database.js";

// 4️⃣ Start server
const PORT = process.env.PORT || 4000;
const server = app.listen(PORT, () => {
  console.log(
    `Server started on PORT: ${PORT} in ${process.env.NODE_ENV} mode`,
  );
});

// 5️⃣ Handle unhandled promise rejections
process.on("unhandledRejection", (err: Error) => {
  console.error(`Error: ${err.stack}`);
  console.log("Shutting down the server due to Unhandled Promise rejection");
  server.close(() => {
    process.exit(1);
  });
});
