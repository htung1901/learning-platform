import express from "express";
import { protectedRoute } from "../middlewares/authMiddleware.js";
import {
  getAvailableCourses,
  getMyCourses,
} from "../controllers/studentController.js";

const router = express.Router();

// All student routes require authentication
router.use(protectedRoute);

// Lấy danh sách khóa học chưa mua
router.get("/courses/available", getAvailableCourses);
router.get("/courses/my", getMyCourses);

export default router;
