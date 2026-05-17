import Course from "../models/Course.js";
import Enrollment from "../models/Enrollment.js";

// Fake payment: create enrollment and increment student count
export const fakePayment = async (req, res) => {
  try {
    const user = req.user;
    const { courseId, paymentMethod, amount } = req.body;

    if (!courseId)
      return res.status(400).json({ message: "courseId is required" });

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });

    // If already enrolled, return existing
    let enrollment = await Enrollment.findOne({ userId: user._id, courseId });
    if (enrollment) {
      return res
        .status(200)
        .json({ message: "Already purchased", data: enrollment });
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

export default { fakePayment };
