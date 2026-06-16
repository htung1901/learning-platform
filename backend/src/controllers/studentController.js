import Course from "../models/Course.js";
import Enrollment from "../models/Enrollment.js";
import LearningPath from "../models/LearningPath.js";

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
        const completedLessons = item.completedLessonIds?.length || 0;
        const progress =
          totalLessons > 0
            ? Math.max(
                0,
                Math.min(
                  100,
                  Math.round((completedLessons / totalLessons) * 100),
                ),
              )
            : Math.max(0, Math.min(100, Math.round(item.progressPercent || 0)));

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

    query.instructorId = { $ne: userId };

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

export const saveLearningPath = async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      name,
      category = "Tất cả",
      timeLimitSeconds = 0,
      totalDuration = 0,
      totalValue = 0,
      courses = [],
    } = req.body || {};

    if (!Array.isArray(courses) || courses.length === 0) {
      return res.status(400).json({
        message: "Lộ trình không hợp lệ. Vui lòng generate trước khi lưu.",
      });
    }

    const normalizedCourses = courses
      .map((course, index) => {
        const courseId = course?.courseId || course?._id;
        if (!courseId) return null;

        return {
          courseId,
          order: index + 1,
          title: course?.title || `Khóa học ${index + 1}`,
          totalDuration: Number(course?.totalDuration) || 0,
          valueScore: Number(course?.valueScore) || 0,
          ratingAvg: Number(course?.ratingAvg) || 0,
          difficultyScore: Number(course?.difficultyScore) || 0,
          exerciseScore: Number(course?.exerciseScore) || 0,
        };
      })
      .filter(Boolean);

    if (normalizedCourses.length === 0) {
      return res.status(400).json({
        message: "Không có khóa học hợp lệ để lưu lộ trình.",
      });
    }

    const pathName =
      typeof name === "string" && name.trim()
        ? name.trim()
        : `Lộ trình ${category} - ${new Date().toLocaleString("vi-VN")}`;

    const learningPath = await LearningPath.create({
      userId,
      name: pathName,
      category,
      timeLimitSeconds: Number(timeLimitSeconds) || 0,
      totalDuration: Number(totalDuration) || 0,
      totalValue: Number(totalValue) || 0,
      courses: normalizedCourses,
    });

    return res.status(201).json({
      message: "Đã lưu lộ trình học thành công",
      data: learningPath,
    });
  } catch (error) {
    console.error("Lỗi khi lưu lộ trình học", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const getSavedLearningPaths = async (req, res) => {
  try {
    const userId = req.user._id;

    const learningPaths = await LearningPath.find({ userId })
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      message: "Lấy danh sách lộ trình đã lưu thành công",
      data: learningPaths,
    });
  } catch (error) {
    console.error("Lỗi khi lấy lộ trình đã lưu", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// Lấy payload bài học cho student (course + active lesson + enrollment)
export const getLessonForStudent = async (req, res) => {
  try {
    const userId = req.user._id;
    const { courseId, lessonId } = req.params;

    const enrollment = await Enrollment.findOne({ userId, courseId });
    if (!enrollment) {
      return res.status(403).json({
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
          completedLessonIds: enrollment.completedLessonIds || [],
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
      return res.status(403).json({
        message: "Bạn chưa đăng ký khóa học này hoặc không có quyền.",
      });
    }

    const course = await Course.findById(courseId).select(
      "lessons totalLessons",
    );
    if (!course) {
      return res.status(404).json({ message: "Khóa học không tồn tại" });
    }

    const lesson = (course.lessons || []).find(
      (item) => String(item._id) === String(lessonId),
    );
    if (!lesson) {
      return res.status(404).json({ message: "Bài học không tồn tại" });
    }

    enrollment.completedLessonIds = enrollment.completedLessonIds || [];

    if (markCompleted) {
      const lessonObjectId = lesson._id;
      const alreadyCompleted = enrollment.completedLessonIds.some(
        (completedLessonId) =>
          String(completedLessonId) === String(lessonObjectId),
      );

      if (!alreadyCompleted) {
        enrollment.completedLessonIds.push(lessonObjectId);
      }

      const totalLessons =
        course.totalLessons || (course.lessons || []).length || 0;
      const completedLessons = enrollment.completedLessonIds.length;

      enrollment.progressPercent = totalLessons
        ? Math.min(100, Math.round((completedLessons / totalLessons) * 100))
        : 0;

      if (completedLessons >= totalLessons && totalLessons > 0) {
        enrollment.status = "completed";
        enrollment.completedAt = new Date();
      } else {
        enrollment.status = "active";
        enrollment.completedAt = undefined;
      }
    }

    if (typeof progressPercent === "number") {
      enrollment.progressPercent = Math.max(
        0,
        Math.min(100, Math.round(progressPercent)),
      );
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
