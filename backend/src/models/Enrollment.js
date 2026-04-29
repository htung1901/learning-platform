import mongoose from "mongoose";

const enrollmentSchema = new mongoose.Schema(
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
    status: {
      type: String,
      enum: ["active", "completed", "cancelled", "refunded"],
      default: "active",
    },
    purchasedAt: { type: Date },
    completedAt: { type: Date },
    progressPercent: { type: Number, default: 0 },
    lastAccessedAt: { type: Date },
  },
  {
    timestamps: true,
  },
);

enrollmentSchema.index({ userId: 1, courseId: 1 }, { unique: true });

const Enrollment = mongoose.model("Enrollment", enrollmentSchema);
export default Enrollment;
