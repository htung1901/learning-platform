import Course from "../models/Course.js";
import Enrollment from "../models/Enrollment.js";
import CartItem from "../models/CartItem.js";

// Fake payment: create enrollment and increment student count
export const fakePayment = async (req, res) => {
  try {
    const user = req.user;
    const { courseId, paymentMethod, amount } = req.body;

    if (!courseId)
      return res.status(400).json({ message: "courseId is required" });

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });

    if (String(course.instructorId) === String(user._id)) {
      return res
        .status(403)
        .json({ message: "Bạn không thể mua khóa học do chính mình tạo" });
    }

    // If already enrolled, return existing
    let enrollment = await Enrollment.findOne({ userId: user._id, courseId });
    if (enrollment) {
      return res.status(409).json({ message: "Bạn đã mua khóa học này rồi" });
    }

    enrollment = await Enrollment.create({
      userId: user._id,
      courseId,
      amount: amount || course.price || 0,
      paymentMethod: paymentMethod || "fake",
    });

    // increment student counts
    course.totalStudents = (course.totalStudents || 0) + 1;
    await course.save();

    return res
      .status(201)
      .json({ message: "Payment simulated", data: enrollment });
  } catch (error) {
    console.error("Payment error", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const fakeCartPayment = async (req, res) => {
  try {
    const user = req.user;
    const { paymentMethod, coupon } = req.body;

    const cartItems = await CartItem.find({ userId: user._id }).populate({
      path: "courseId",
      match: { status: "published" },
    });

    const validItems = cartItems.filter((item) => item.courseId);

    if (validItems.length === 0) {
      return res.status(400).json({ message: "Giỏ hàng trống" });
    }

    const purchasedCourseIds = [];
    const skippedCourseIds = [];
    let totalAmount = 0;

    for (const item of validItems) {
      const course = item.courseId;

      if (String(course.instructorId) === String(user._id)) {
        skippedCourseIds.push(course._id);
        continue;
      }

      const existingEnrollment = await Enrollment.findOne({
        userId: user._id,
        courseId: course._id,
      });

      if (existingEnrollment) {
        skippedCourseIds.push(course._id);
        continue;
      }

      totalAmount += Number(course.price || 0);

      await Enrollment.create({
        userId: user._id,
        courseId: course._id,
        amount: Number(course.price || 0),
        paymentMethod: paymentMethod || "fake",
      });

      course.totalStudents = (course.totalStudents || 0) + 1;
      await course.save();

      purchasedCourseIds.push(course._id);
    }

    if (purchasedCourseIds.length === 0) {
      return res.status(400).json({
        message: "Giỏ hàng không có khóa học hợp lệ để thanh toán",
      });
    }

    const discount =
      coupon?.trim().toUpperCase() === "SAVE10"
        ? Math.round(totalAmount * 0.1)
        : 0;
    const vat = Math.round((totalAmount - discount) * 0.08);
    const payableAmount = Math.max(0, totalAmount - discount + vat);

    await CartItem.deleteMany({ userId: user._id });

    return res.status(201).json({
      message: "Thanh toán giỏ hàng thành công",
      data: {
        purchasedCourseIds,
        skippedCourseIds,
        totalAmount,
        discount,
        vat,
        payableAmount,
      },
    });
  } catch (error) {
    console.error("Cart payment error", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export default { fakePayment, fakeCartPayment };
