import express from "express";
import { learningPathHandler } from "../controllers/recommendationController.js";

const router = express.Router();

// Protected route expected: server applies protected middleware before mounting
router.post("/learning-path", learningPathHandler);

export default router;
