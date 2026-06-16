import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
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
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String },
  },
  {
    timestamps: true,
  },
);

reviewSchema.index({ userId: 1, courseId: 1 }, { unique: true });

reviewSchema.statics.calcAverageRatings = async function (courseId) {
  const stats = await this.aggregate([
    { $match: { courseId: courseId } },
    {
      $group: {
        _id: "$courseId",
        ratingCount: { $sum: 1 },
        ratingAvg: { $avg: "$rating" },
      },
    },
  ]);

  const Course = mongoose.model("Course");
  const course = await Course.findById(courseId);
  if (!course) return;

  if (stats.length > 0) {
    course.ratingCount = stats[0].ratingCount;
    course.ratingAvg = Math.round(stats[0].ratingAvg * 10) / 10;
    await course.save();
    return;
  }

  course.ratingCount = 0;
  course.ratingAvg = 0;
  await course.save();
};

reviewSchema.post("save", function () {
  this.constructor.calcAverageRatings(this.courseId);
});

reviewSchema.post(/^findOneAnd/, async function (doc) {
  if (doc) {
    await doc.constructor.calcAverageRatings(doc.courseId);
  }
});

const Review = mongoose.model("Review", reviewSchema);
export default Review;
