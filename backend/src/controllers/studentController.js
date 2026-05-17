import Course from "../models/Course.js";
import Enrollment from "../models/Enrollment.js";

export const getMyCourses = async (req, res) => {
  try {
    const userId = req.user._id;

    const enrollments = await Enrollment.find({
      userId,
      status: { $ne: "cancelled" },
    })
      .populate({
        path: "courseId",
        match: { status: "published" },
        populate: { path: "instructorId", select: "displayName username" },
      })
      .sort({ purchasedAt: -1, createdAt: -1 })
      .lean();

    const courses = enrollments
      .filter((item) => item.courseId)
      .map((item) => {
        const course = item.courseId;
        const sortedLessons = [...(course.lessons || [])].sort(
          (a, b) => (a.order || 0) - (b.order || 0),
        );
        const totalLessons = course.totalLessons || sortedLessons.length || 0;
        const progress = Math.max(
          0,
          Math.min(100, Math.round(item.progressPercent || 0)),
        );
        const completedLessons = Math.round((progress / 100) * totalLessons);

        return {
          enrollmentId: item._id,
          courseId: course._id,
          title: course.title,
          thumbnailUrl: course.thumbnailUrl,
          level: course.level,
          category: course.category,
          totalDuration: course.totalDuration || 0,
          totalLessons,
          completedLessons,
          progress,
          enrolledAt: item.purchasedAt || item.createdAt,
          firstLessonId: sortedLessons[0]?._id || null,
          instructor: {
            displayName:
              course.instructorId?.displayName ||
              course.instructorId?.username ||
              "",
          },
        };
      });

    return res.status(200).json({
      message: "Lấy khóa học đã mua thành công",
      data: courses,
    });
  } catch (error) {
    console.error("Lỗi khi lấy khóa học đã mua", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

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

export default { getMyCourses, getAvailableCourses };
