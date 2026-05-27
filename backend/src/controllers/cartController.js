import CartItem from "../models/CartItem.js";
import Course from "../models/Course.js";
import Enrollment from "../models/Enrollment.js";

export const getCart = async (req, res) => {
  try {
    const userId = req.user._id;

    const items = await CartItem.find({ userId })
      .populate({
        path: "courseId",
        match: { status: "published" },
        populate: { path: "instructorId", select: "displayName username" },
      })
      .sort({ createdAt: -1 })
      .lean();

    const courses = items
      .filter(
        (it) =>
          it.courseId &&
          String(it.courseId.instructorId?._id || it.courseId.instructorId) !==
            String(userId),
      )
      .map((it) => ({ ...it.courseId, cartItemId: it._id }));

    return res
      .status(200)
      .json({ message: "Lấy giỏ hàng thành công", data: courses });
  } catch (error) {
    console.error("Lỗi khi lấy giỏ hàng", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const addToCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const { courseId } = req.body;

    if (!courseId) {
      return res.status(400).json({ message: "Thiếu courseId" });
    }

    const course = await Course.findById(courseId);
    if (!course || course.status !== "published") {
      return res.status(404).json({ message: "Khóa học không tồn tại" });
    }

    if (String(course.instructorId) === String(userId)) {
      return res
        .status(403)
        .json({ message: "Bạn không thể thêm khóa học do chính mình tạo" });
    }

    const existingEnrollment = await Enrollment.findOne({ userId, courseId });
    if (existingEnrollment) {
      return res.status(409).json({ message: "Bạn đã mua khóa học này rồi" });
    }

    try {
      const created = await CartItem.create({ userId, courseId });
      return res
        .status(201)
        .json({ message: "Thêm vào giỏ hàng thành công", data: created });
    } catch (err) {
      // Duplicate key -> already in cart
      if (err.code === 11000) {
        return res
          .status(400)
          .json({ message: "Khóa học đã có trong giỏ hàng" });
      }
      throw err;
    }
  } catch (error) {
    console.error("Lỗi khi thêm vào giỏ hàng", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const removeFromCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const { courseId } = req.params;

    if (!courseId) {
      return res.status(400).json({ message: "Thiếu courseId" });
    }

    const removed = await CartItem.findOneAndDelete({ userId, courseId });
    if (!removed) {
      return res.status(404).json({ message: "Không tìm thấy mục trong giỏ" });
    }

    return res.status(200).json({ message: "Xóa khỏi giỏ hàng thành công" });
  } catch (error) {
    console.error("Lỗi khi xóa khỏi giỏ hàng", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export default { getCart, addToCart, removeFromCart };
