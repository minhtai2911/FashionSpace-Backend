import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import passport from "passport";
import session from "express-session";

import authRoute from "./routes/authRoute.js";
import userRoute from "./routes/userRoute.js";
import productRoute from "./routes/productRoute.js";
import reviewRoute from "./routes/reviewRoute.js";
import userRoleRoute from "./routes/userRoleRoute.js";
import orderRoute from "./routes/orderRoute.js";
import shoppingCartRoute from "./routes/shoppingCartRoute.js";
import categoryRoute from "./routes/categoryRoute.js";
import productVariantRoute from "./routes/productVariantRoute.js";
// import chatbotRoute from "./routes/chatbotRoute.js";
import statisticRoute from "./routes/statisticRoute.js";
import recommendationRoute from "./routes/recommendationRoute.js";
import productViewRoute from "./routes/productViewRoute.js";
import userAddressRoute from "./routes/userAddressRoute.js";

const app = express();

app.use(
  session({
    secret: process.env.KEY_SESSION,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false, maxAge: 60 * 60 * 1000 },
  })
);

app.use(express.json());
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static("src/public"));

app.use(passport.initialize());
app.use(passport.session());

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

dotenv.config();
const PORT = process.env.PORT || 5000;
const DB_URL = process.env.DB_URL;

mongoose
  .connect(DB_URL)
  .then(() => {
    console.log("Database connected successful!");
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log(err);
  });

app.use("/api/v1/auth", authRoute);
app.use("/api/v1/user", userRoute);
app.use("/api/v1/product", productRoute);
app.use("/api/v1/review", reviewRoute);
app.use("/api/v1/userRole", userRoleRoute);
app.use("/api/v1/order", orderRoute);
app.use("/api/v1/shoppingCart", shoppingCartRoute);
app.use("/api/v1/category", categoryRoute);
app.use("/api/v1/productVariant", productVariantRoute);
// app.use("/api/v1/chatbot", chatbotRoute);
app.use("/api/v1/statistic", statisticRoute);
app.use("/api/v1/recommendation", recommendationRoute);
app.use("/api/v1/productView", productViewRoute);
app.use("/api/v1/userAddress", userAddressRoute);
