import express from "express";
import { protectedRoute } from "../middlewares/authMiddleware.js";
import { isInstructor } from "../middlewares/instructorMiddleware.js";
import {
  createCourse,
  getMyCourses,
  updateMyCourse,
  submitCourseForReview,
} from "../controllers/instructorController.js";
import {
  createCourseValidator,
  updateCourseValidator,
} from "../validators/courseValidators.js";

const router = express.Router();

router.use(protectedRoute);
router.use(isInstructor);

router.get("/courses", getMyCourses);
router.post("/courses", createCourseValidator, createCourse);
router.patch("/courses/:courseId", updateCourseValidator, updateMyCourse);
router.post("/courses/:courseId/submit", submitCourseForReview);

export default router;
