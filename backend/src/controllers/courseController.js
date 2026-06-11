import Course from "../models/Course.js";

// Public: list published courses with pagination and optional filters
export const getPublishedCourses = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 12;
    const q = (req.query.q || "").trim();
    const category = req.query.category;
    const level = req.query.level;
    const skip = (page - 1) * limit;

    const query = { status: "published" };

    if (q) {
      query.$or = [
        { title: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
      ];
    }

    // Filter by category: match courses where tags array contains the category string
    if (category) query.tags = { $in: [category] };
    if (level) query.level = level;

    const [courses, total] = await Promise.all([
      Course.find(query)
        .populate("instructorId", "username displayName")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Course.countDocuments(query),
    ]);

    return res.status(200).json({
      message: "Lấy danh sách khóa học thành công",
      data: courses,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Lỗi khi lấy khóa học", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// Public: get a single published course by id (includes lessons)
export const getPublishedCourseDetail = async (req, res) => {
  try {
    const { id } = req.params;

    const course = await Course.findOne({
      _id: id,
      status: "published",
    }).populate("instructorId", "username displayName email");

    if (!course) {
      return res.status(404).json({ message: "Khóa học không tồn tại" });
    }

    const sortedLessons = [...(course.lessons || [])].sort(
      (a, b) => (a.order || 0) - (b.order || 0),
    );

    return res.status(200).json({
      message: "Lấy chi tiết khóa học thành công",
      data: {
        ...course.toObject(),
        lessons: sortedLessons,
      },
    });
  } catch (error) {
    console.error("Lỗi khi lấy chi tiết khóa học công khai", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export default { getPublishedCourses };
