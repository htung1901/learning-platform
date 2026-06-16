import Review from "../models/Review.js";
import Enrollment from "../models/Enrollment.js";

export const getCourseReviews = async (req, res) => {
  try {
    const { courseId } = req.params;
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.max(
      1,
      Math.min(50, parseInt(req.query.limit, 10) || 10),
    );
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      Review.find({ courseId })
        .populate("userId", "displayName avatarUrl username")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Review.countDocuments({ courseId }),
    ]);

    return res.status(200).json({
      success: true,
      reviews,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return res.status(500).json({ success: false, message: "Lỗi Server" });
  }
};

export const createReview = async (req, res) => {
  try {
    const { courseId, rating, comment } = req.body;
    const userId = req.user._id;

    if (!courseId || !rating) {
      return res.status(400).json({
        success: false,
        message: "Yêu cầu courseId và rating.",
      });
    }

    const normalizedRating = Number(rating);
    if (
      !Number.isFinite(normalizedRating) ||
      normalizedRating < 1 ||
      normalizedRating > 5
    ) {
      return res.status(400).json({
        success: false,
        message: "Rating phải từ 1 đến 5.",
      });
    }

    const enrollment = await Enrollment.findOne({
      userId,
      courseId,
      status: { $in: ["active", "completed"] },
    });

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: "Bạn phải đăng ký khóa học này để đánh giá.",
      });
    }

    if (await Review.findOne({ userId, courseId })) {
      return res.status(400).json({
        success: false,
        message: "Bạn đã đánh giá khóa học này rồi.",
      });
    }

    const review = await Review.create({
      userId,
      courseId,
      rating: normalizedRating,
      comment,
    });

    return res.status(201).json({ success: true, review });
  } catch (error) {
    console.error("Error creating review:", error);
    return res.status(500).json({ success: false, message: "Lỗi Server" });
  }
};

export const updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đánh giá.",
      });
    }

    if (String(review.userId) !== String(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: "Bạn chỉ có thể sửa đánh giá của mình.",
      });
    }

    if (rating !== undefined) {
      const normalizedRating = Number(rating);
      if (
        !Number.isFinite(normalizedRating) ||
        normalizedRating < 1 ||
        normalizedRating > 5
      ) {
        return res.status(400).json({
          success: false,
          message: "Rating phải từ 1 đến 5.",
        });
      }
      review.rating = normalizedRating;
    }

    if (comment !== undefined) {
      review.comment = comment;
    }

    await review.save();
    return res.status(200).json({ success: true, review });
  } catch (error) {
    console.error("Error updating review:", error);
    return res.status(500).json({ success: false, message: "Lỗi Server" });
  }
};

export const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const review = await Review.findById(id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đánh giá.",
      });
    }

    if (String(review.userId) !== String(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: "Bạn chỉ có thể xóa đánh giá của mình.",
      });
    }

    await Review.findOneAndDelete({ _id: id });
    return res.status(200).json({ success: true, message: "Đã xóa đánh giá." });
  } catch (error) {
    console.error("Error deleting review:", error);
    return res.status(500).json({ success: false, message: "Lỗi Server" });
  }
};
