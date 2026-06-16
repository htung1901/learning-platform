import express from "express";
import {
  createReview,
  deleteReview,
  getCourseReviews,
  updateReview,
} from "../controllers/reviewController.js";
import { protectedRoute } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/course/:courseId", getCourseReviews);
router.post("/", protectedRoute, createReview);
router.put("/:id", protectedRoute, updateReview);
router.delete("/:id", protectedRoute, deleteReview);

export default router;
