import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./libs/db.js";
import authRoute from "./routes/authRoute.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import userRoute from "./routes/userRoute.js";
import adminRoute from "./routes/adminRoute.js";
import instructorRoute from "./routes/instructorRoute.js";
import studentRoute from "./routes/studentRoute.js";
import courseRoute from "./routes/courseRoute.js";
import { protectedRoute } from "./middlewares/authMiddleware.js";
import paymentRoute from "./routes/paymentRoute.js";
import uploadRoute from "./routes/uploadRoute.js";
import cartRoute from "./routes/cartRoute.js";
import recommendationRoute from "./routes/recommendationRoute.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

const buildAllowedOrigins = () => {
  const envOrigins = [process.env.CLIENT_URL, process.env.CLIENT_URLS]
    .filter(Boolean)
    .flatMap((value) => value.split(","))
    .map((value) => value.trim())
    .filter(Boolean);

  return new Set([
    ...envOrigins,
    "http://localhost:5173",
    "http://127.0.0.1:5173",
  ]);
};

const isLocalDevOrigin = (origin) => {
  return (
    /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin) ||
    /^http:\/\/192\.168\.\d+\.\d+:\d+$/.test(origin) ||
    /^http:\/\/10\.\d+\.\d+\.\d+:\d+$/.test(origin) ||
    /^http:\/\/172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+:\d+$/.test(origin)
  );
};

// middleware
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = buildAllowedOrigins();

      // Allow non-browser tools and common local development origins
      if (!origin || allowedOrigins.has(origin) || isLocalDevOrigin(origin)) {
        callback(null, true);
        return;
      }

      console.warn("CORS blocked origin:", origin);
      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  }),
);

// public routes
app.use("/api/auth", authRoute);

// admin routes (có middleware riêng)
app.use("/api/admin", adminRoute);

// instructor routes
app.use("/api/instructor", instructorRoute);

// student routes
app.use("/api/student", studentRoute);

// public courses
app.use("/api/courses", courseRoute);

// public recommendation routes: can work for guests, and use auth token when present
app.use("/api/recommendations", recommendationRoute);

// private routes
app.use(protectedRoute);
// cart routes (protected)
app.use("/api/cart", cartRoute);
app.use("/api/users", userRoute);
// payment routes (protected)
app.use("/api/payments", paymentRoute);
// upload routes (protected)
app.use("/api", uploadRoute);

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server bắt đầu trên cổng ${PORT}`);
  });
});
