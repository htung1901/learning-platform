import express from "express";
import {
  authMe,
  updateProfile,
  changePassword,
  getPublicProfile,
} from "../controllers/userController.js";
import {
  updateProfileValidator,
  changePasswordValidator,
} from "../validators/userValidators.js";
import { protectedRoute } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Public profile route (no auth)
router.get("/:username", getPublicProfile);

// Protect remaining routes
router.use(protectedRoute);

router.get("/me", authMe);
router.patch("/me", updateProfileValidator, updateProfile);
router.post("/me/password", changePasswordValidator, changePassword);

export default router;
