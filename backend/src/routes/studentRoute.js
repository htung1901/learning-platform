import express from "express";
import { protectedRoute } from "../middlewares/authMiddleware.js";
import { getAvailableCourses } from "../controllers/studentController.js";

const router = express.Router();

// All student routes require authentication
router.use(protectedRoute);

// Lấy danh sách khóa học chưa mua
router.get("/courses/available", getAvailableCourses);

export default router;
