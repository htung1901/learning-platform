import express from "express";
import { protectedRoute } from "../middlewares/authMiddleware.js";
import { isAdmin } from "../middlewares/adminMiddleware.js";
import {
  getPendingCourses,
  approveCourse,
  rejectCourse,
  getAdminStats,
  getAllUsers,
  updateUserRole,
} from "../controllers/adminController.js";

const router = express.Router();

// Tất cả routes admin phải được xác thực và check admin role
router.use(protectedRoute);
router.use(isAdmin);

// Khóa học chờ duyệt
router.get("/courses/pending", getPendingCourses);

// Duyệt khóa học
router.post("/courses/:courseId/approve", approveCourse);

// Từ chối khóa học
router.post("/courses/:courseId/reject", rejectCourse);

// Thống kê admin
router.get("/stats", getAdminStats);

// User management
router.get("/users", getAllUsers);
router.patch("/users/:userId/role", updateUserRole);

export default router;
