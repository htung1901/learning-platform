import express from "express";
import { protectedRoute } from "../middlewares/authMiddleware.js";
import { fakePayment } from "../controllers/paymentController.js";

const router = express.Router();

// Simulate payment (protected)
router.post("/fake", protectedRoute, fakePayment);

export default router;
