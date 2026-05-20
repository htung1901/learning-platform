import express from "express";
import fs from "fs";
import upload from "../middlewares/uploadMiddleware.js";
import { uploadToCloudinary } from "../libs/cloudinary.js";
import { protectedRoute } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Upload ảnh cho khóa học
router.post(
  "/upload-image",
  protectedRoute,
  upload.single("image"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "Không có file được tải lên" });
      }

      const imageUrl = await uploadToCloudinary(req.file.path, "course-images");

      // Xóa file tạm từ server
      fs.unlinkSync(req.file.path);

      res.json({
        message: "Tải lên ảnh thành công",
        imageUrl,
      });
    } catch (error) {
      // Xóa file tạm nếu có lỗi
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }

      console.error("Lỗi upload:", error);
      res.status(500).json({
        message: "Lỗi khi tải lên ảnh",
        error: error.message,
      });
    }
  },
);

// Upload video cho bài học
router.post(
  "/upload-video",
  protectedRoute,
  upload.single("video"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "Không có file được tải lên" });
      }

      const videoUrl = await uploadToCloudinary(req.file.path, "course-videos");

      // Xóa file tạm từ server
      fs.unlinkSync(req.file.path);

      res.json({
        message: "Tải lên video thành công",
        videoUrl,
      });
    } catch (error) {
      // Xóa file tạm nếu có lỗi
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }

      console.error("Lỗi upload:", error);
      res.status(500).json({
        message: "Lỗi khi tải lên video",
        error: error.message,
      });
    }
  },
);

export default router;
