import express from "express";
import { protectedRoute } from "../middlewares/authMiddleware.js";
import {
  getAvailableCourses,
  getMyCourses,
  getLessonForStudent,
  updateLessonProgress,
} from "../controllers/studentController.js";

const router = express.Router();

// All student routes require authentication
router.use(protectedRoute);

// Lấy danh sách khóa học chưa mua
router.get("/courses/available", getAvailableCourses);
router.get("/courses/my", getMyCourses);

// Lấy bài học cụ thể cho student
router.get("/courses/:courseId/lessons/:lessonId", getLessonForStudent);

// Cập nhật tiến độ cho bài học
router.post(
  "/courses/:courseId/lessons/:lessonId/progress",
  updateLessonProgress,
);

export default router;
