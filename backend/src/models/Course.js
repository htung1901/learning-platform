import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
  {
    instructorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    title: { type: String, required: true, trim: true },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    description: { type: String },
    thumbnailUrl: { type: String },
    introVideoUrl: { type: String },
    level: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "beginner",
    },
    price: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["draft", "pending", "published", "rejected", "archived"],
      default: "draft",
      index: true,
    },
    // Duyệt khóa học
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // admin user
    },
    approvedAt: { type: Date },
    rejectedReason: { type: String }, // lý do từ chối nếu status = rejected
    submittedAt: { type: Date }, // khi instructor gửi duyệt
    prerequisites: { type: [String], default: [] },
    tags: { type: [String], default: [] },
    totalDuration: { type: Number, default: 0 }, // in seconds
    totalLessons: { type: Number, default: 0 },
    totalStudents: { type: Number, default: 0 },
    ratingAvg: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
    // Value score used by Learning Path Recommendation: integer 1..10
    valueScore: { type: Number, default: 1, min: 1, max: 10 },
  },
  {
    timestamps: true,
  },
);

// Lessons subdocuments
const lessonSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    videoUrl: { type: String },
    duration: { type: Number, default: 0 }, // seconds
    summary: { type: String },
    order: { type: Number, default: 0 },
    resources: { type: [String], default: [] },
    attachments: {
      type: [
        {
          url: { type: String },
          publicId: { type: String },
          fileName: { type: String },
          mimeType: { type: String },
          size: { type: Number },
        },
      ],
      default: [],
    },
  },
  { _id: true, timestamps: true },
);

courseSchema.add({ lessons: { type: [lessonSchema], default: [] } });

// Index để tìm khóa học chờ duyệt
courseSchema.index({ status: 1, submittedAt: 1 });

const Course = mongoose.model("Course", courseSchema);
export default Course;
