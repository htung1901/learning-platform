import Course from "../models/Course.js";
import Enrollment from "../models/Enrollment.js";

// Lấy danh sách khóa học chưa mua của student (published và chưa enroll)
export const getAvailableCourses = async (req, res) => {
  try {
    const userId = req.user._id;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 12;
    const q = (req.query.q || "").trim();
    const skip = (page - 1) * limit;

    // Lấy danh sách courseId mà user đã mua/enrolled
    const enrollments = await Enrollment.find({ userId }).select("courseId");
    const purchasedIds = enrollments.map((e) => e.courseId);

    const query = { status: "published" };
    if (purchasedIds.length > 0) {
      query._id = { $nin: purchasedIds };
    }

    if (q) {
      // simple text search on title or description
      query.$or = [
        { title: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
      ];
    }

    const [courses, total] = await Promise.all([
      Course.find(query)
        .populate("instructorId", "username displayName")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Course.countDocuments(query),
    ]);

    return res.status(200).json({
      message: "Lấy danh sách khóa học chưa mua thành công",
      data: courses,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Lỗi khi lấy khóa học chưa mua", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export default { getAvailableCourses };
