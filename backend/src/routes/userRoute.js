import express from "express";
import {
  authMe,
  updateProfile,
  changePassword,
  getPublicProfile,
  changeEmail,
  changeUsername,
  toggleInstructor,
} from "../controllers/userController.js";
import {
  updateProfileValidator,
  changePasswordValidator,
  changeEmailValidator,
  changeUsernameValidator,
} from "../validators/userValidators.js";
import { protectedRoute } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Public profile route (no auth)
router.get("/:username", getPublicProfile);

// Protected routes for current user (require access token)
router.get("/me", protectedRoute, authMe);
router.patch("/me", protectedRoute, updateProfileValidator, updateProfile);
router.post(
  "/me/password",
  protectedRoute,
  changePasswordValidator,
  changePassword,
);
router.post("/me/email", protectedRoute, changeEmailValidator, changeEmail);
router.post(
  "/me/username",
  protectedRoute,
  changeUsernameValidator,
  changeUsername,
);
router.put("/me/toggle-instructor", protectedRoute, toggleInstructor);

export default router;
