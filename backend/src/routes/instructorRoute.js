import express from "express";
import { protectedRoute } from "../middlewares/authMiddleware.js";
import { isInstructor } from "../middlewares/instructorMiddleware.js";
import {
  createCourse,
  getMyCourses,
  getMyCourseDetail,
  updateMyCourse,
  submitCourseForReview,
  createLesson,
  updateLesson,
  deleteLesson,
} from "../controllers/instructorController.js";
import {
  createCourseValidator,
  updateCourseValidator,
} from "../validators/courseValidators.js";

const router = express.Router();

router.use(protectedRoute);
router.use(isInstructor);

router.get("/courses", getMyCourses);
router.get("/courses/:courseId", getMyCourseDetail);
router.post("/courses", createCourseValidator, createCourse);
router.patch("/courses/:courseId", updateCourseValidator, updateMyCourse);
router.post("/courses/:courseId/submit", submitCourseForReview);
router.post("/courses/:courseId/lessons", createLesson);
router.patch("/courses/:courseId/lessons/:lessonId", updateLesson);
router.delete("/courses/:courseId/lessons/:lessonId", deleteLesson);

export default router;
