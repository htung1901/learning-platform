import express from "express";
import { protectedRoute } from "../middlewares/authMiddleware.js";
import {
  fakePayment,
  fakeCartPayment,
} from "../controllers/paymentController.js";

const router = express.Router();

// Simulate payment (protected)
router.post("/fake", protectedRoute, fakePayment);

// Simulate cart checkout payment (protected)
router.post("/fake-cart", protectedRoute, fakeCartPayment);

export default router;
