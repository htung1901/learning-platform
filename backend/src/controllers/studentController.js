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

// Lấy payload bài học cho student (course + active lesson + enrollment)
export const getLessonForStudent = async (req, res) => {
  try {
    const userId = req.user._id;
    const { courseId, lessonId } = req.params;

    const enrollment = await Enrollment.findOne({ userId, courseId });
    if (!enrollment) {
      return res
        .status(403)
        .json({
          message: "Bạn chưa đăng ký khóa học này hoặc không có quyền.",
        });
    }

    const course = await Course.findById(courseId).populate(
      "instructorId",
      "displayName username",
    );

    if (!course) {
      return res.status(404).json({ message: "Khóa học không tồn tại" });
    }

    const sortedLessons = [...(course.lessons || [])].sort(
      (a, b) => (a.order || 0) - (b.order || 0),
    );

    const lesson = sortedLessons.find(
      (l) => String(l._id) === String(lessonId),
    );
    if (!lesson) {
      return res.status(404).json({ message: "Bài học không tồn tại" });
    }

    return res.status(200).json({
      message: "Lấy bài học thành công",
      data: {
        course: {
          _id: course._id,
          title: course.title,
          thumbnailUrl: course.thumbnailUrl,
          introVideoUrl: course.introVideoUrl,
          totalDuration: course.totalDuration || 0,
          totalLessons: course.totalLessons || sortedLessons.length || 0,
          instructor: {
            displayName:
              course.instructorId?.displayName ||
              course.instructorId?.username ||
              "",
          },
        },
        lesson: lesson,
        lessons: sortedLessons,
        enrollment: {
          progressPercent: enrollment.progressPercent || 0,
          lastAccessedAt: enrollment.lastAccessedAt,
          status: enrollment.status,
        },
      },
    });
  } catch (error) {
    console.error("Lỗi khi lấy bài học cho student", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// Cập nhật tiến độ bài học của student
export const updateLessonProgress = async (req, res) => {
  try {
    const userId = req.user._id;
    const { courseId, lessonId } = req.params;
    const { progressPercent, markCompleted } = req.body;

    const enrollment = await Enrollment.findOne({ userId, courseId });
    if (!enrollment) {
      return res
        .status(403)
        .json({
          message: "Bạn chưa đăng ký khóa học này hoặc không có quyền.",
        });
    }

    if (typeof progressPercent === "number") {
      enrollment.progressPercent = Math.max(
        0,
        Math.min(100, Math.round(progressPercent)),
      );
    }

    if (markCompleted) {
      enrollment.status = "completed";
      enrollment.completedAt = new Date();
      enrollment.progressPercent = 100;
    }

    enrollment.lastAccessedAt = new Date();
    await enrollment.save();

    return res
      .status(200)
      .json({ message: "Cập nhật tiến độ thành công", data: enrollment });
  } catch (error) {
    console.error("Lỗi khi cập nhật tiến độ bài học", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};
