import express from "express";
import { getPublishedCourses, getPublishedCourseDetail } from "../controllers/courseController.js";

const router = express.Router();

// Public route: list published courses
router.get("/", getPublishedCourses);
router.get("/:id", getPublishedCourseDetail);

export default router;

