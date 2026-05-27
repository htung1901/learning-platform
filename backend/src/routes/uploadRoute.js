import express from "express";
import fs from "fs";
import upload from "../middlewares/uploadMiddleware.js";
import { uploadToCloudinary } from "../libs/cloudinary.js";
import { protectedRoute } from "../middlewares/authMiddleware.js";
import multer from "multer";
import path from "path";

const normalizeUploadedFileName = (fileName = "") => {
  if (!fileName) return fileName;

  try {
    const decoded = Buffer.from(fileName, "latin1").toString("utf8");

    // If multer already gave us a correct Unicode string, keep it as-is.
    if (/^[\x00-\x7F]*$/.test(fileName)) {
      return fileName;
    }

    return decoded || fileName;
  } catch {
    return fileName;
  }
};

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
      // Return stack for debugging (remove in production)
      res.status(500).json({
        message: "Lỗi khi tải lên ảnh",
        error: error.message,
        stack: error.stack,
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
      // Return stack for debugging (remove in production)
      res.status(500).json({
        message: "Lỗi khi tải lên video",
        error: error.message,
        stack: error.stack,
      });
    }
  },
);

// Upload tài liệu (pdf, docx, zip)
const attachmentStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads"),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname),
    );
  },
});

const attachmentUpload = multer({
  storage: attachmentStorage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
  fileFilter: (req, file, cb) => {
    const allowed = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/zip",
      "application/x-zip-compressed",
    ];

    if (allowed.includes(file.mimetype)) return cb(null, true);
    return cb(new Error("Định dạng file không được hỗ trợ. Chỉ pdf/docx/zip."));
  },
});

router.post(
  "/upload-attachment",
  protectedRoute,
  attachmentUpload.single("attachment"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "Không có file được tải lên" });
      }

      const result = await uploadToCloudinary(
        req.file.path,
        "course-attachments",
      );

      // Try to get more info from uploader via cloudinary lib if available
      // uploadToCloudinary currently returns secure_url; return that plus original metadata
      const attachment = {
        url: result,
        publicId: undefined,
        fileName: normalizeUploadedFileName(req.file.originalname),
        mimeType: req.file.mimetype,
        size: req.file.size,
      };

      // Remove temp file
      fs.unlinkSync(req.file.path);

      return res
        .status(200)
        .json({ message: "Tải lên thành công", attachment });
    } catch (error) {
      if (req.file && fs.existsSync(req.file.path))
        fs.unlinkSync(req.file.path);
      console.error("Lỗi upload attachment:", error);
      return res
        .status(500)
        .json({ message: "Lỗi khi tải lên tài liệu", error: error.message });
    }
  },
);

export default router;
