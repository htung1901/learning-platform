import mongoose from "mongoose";

const progressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true,
    },
    lessonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lesson",
      required: true,
      index: true,
    },
    completed: { type: Boolean, default: false },
    completedAt: { type: Date },
    watchPositionSec: { type: Number, default: 0 },
    watchedDurationSec: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  },
);

progressSchema.index({ userId: 1, lessonId: 1 }, { unique: true });

const Progress = mongoose.model("Progress", progressSchema);
export default Progress;
