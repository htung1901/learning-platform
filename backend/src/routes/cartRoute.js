import express from "express";
import {
  getCart,
  addToCart,
  removeFromCart,
} from "../controllers/cartController.js";

const router = express.Router();

// GET /api/cart - lấy giỏ hàng của user
router.get("/", getCart);

// POST /api/cart - thêm course vào giỏ
router.post("/", addToCart);

// DELETE /api/cart/:courseId - xóa course khỏi giỏ
router.delete("/:courseId", removeFromCart);

export default router;
