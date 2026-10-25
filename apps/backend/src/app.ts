import express from "express";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";
import fileUpload from "express-fileupload";
import productRouter from "./routes/productRoute.js";

import {
  globalErrHandler,
  notFoundErr,
} from "./middlewares/globalErrHandler.js";
import userRouter from "./routes/userRoute.js";
import orderRouter from "./routes/orderRoute.js";
import paymentRouter from "./routes/paymentRoute.js";

const app = express(); //initilize express for routing.
if (process.env.NODE_ENV === "DEVELOPMENT") {
  app.use(morgan("dev"));
}
app.use(express.json({ limit: "10kb" })); //pass incoming JSON data.
app.use(express.urlencoded({ extended: true })); //parse html form into JS objects.
app.set("query parser", "extended"); //Controls how URL query strings {gte & lte} are parsed.
app.use(cookieParser()); //Stored cookie is req.cookie
app.use(fileUpload()); //media upload, now multer is better

app.use("/api/v1", productRouter);
app.use("/api/v1", userRouter);
app.use("/api/v1", orderRouter);
app.use("/api/v1", paymentRouter);

app.use("/api", notFoundErr);
app.use(globalErrHandler);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
if (process.env.NODE_ENV === "PRODUCTION") {
  app.use(express.static(path.join(__dirname, "../../frontend/dist")));
  app.use((req, res) => {
    res.sendFile(path.resolve(__dirname, "../../frontend/dist/index.html"));
  });
}

export default app;
