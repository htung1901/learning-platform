import mongoose from "mongoose";

const learningPathCourseSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    order: { type: Number, required: true },
    title: { type: String, required: true },
    totalDuration: { type: Number, default: 0 },
    valueScore: { type: Number, default: 0 },
    ratingAvg: { type: Number, default: 0 },
    difficultyScore: { type: Number, default: 0 },
    exerciseScore: { type: Number, default: 0 },
  },
  { _id: false },
);

const learningPathSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    category: { type: String, default: "Tất cả" },
    timeLimitSeconds: { type: Number, default: 0 },
    totalDuration: { type: Number, default: 0 },
    totalValue: { type: Number, default: 0 },
    courses: { type: [learningPathCourseSchema], default: [] },
  },
  { timestamps: true },
);

learningPathSchema.index({ userId: 1, createdAt: -1 });

const LearningPath = mongoose.model("LearningPath", learningPathSchema);
export default LearningPath;
