import Course from "../models/Course.js";
import CartItem from "../models/CartItem.js";
import Enrollment from "../models/Enrollment.js";

const slugify = (value) =>
  value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

const buildUniqueSlug = async (title) => {
  const baseSlug = slugify(title);
  let slug = baseSlug;
  let suffix = 1;

  while (await Course.findOne({ slug })) {
    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  return slug;
};

const getCourseOwnershipQuery = (courseId, userId, role) => {
  if (role === "admin") {
    return { _id: courseId };
  }

  return { _id: courseId, instructorId: userId };
};

const recalculateCourseLessonStats = (course) => {
  const lessons = course.lessons || [];

  course.lessons = lessons
    .map((lesson, index) => ({
      ...(lesson.toObject ? lesson.toObject() : lesson),
      order: lesson.order || index + 1,
    }))
    .sort(
      (firstLesson, secondLesson) =>
        (firstLesson.order || 0) - (secondLesson.order || 0),
    );

  course.totalLessons = course.lessons.length;
  course.totalDuration = course.lessons.reduce(
    (total, lesson) => total + (Number(lesson.duration) || 0),
    0,
  );
};

export const createCourse = async (req, res) => {
  try {
    const instructorId = req.user._id;
    const {
      title,
      description,
      categoryId,
      thumbnailUrl,
      introVideoUrl,
      level,
      price,
      prerequisites,
      tags,
      status,
      valueScore,
    } = req.body;

    const existing = await Course.findOne({
      title: title.trim(),
      instructorId,
    });

    if (existing) {
      return res.status(409).json({
        message: "Bạn đã có một khóa học trùng tên",
      });
    }

    const slug = await buildUniqueSlug(title);
    const finalStatus = status === "pending" ? "pending" : "draft";

    const course = await Course.create({
      instructorId,
      categoryId: categoryId || undefined,
      title: title.trim(),
      slug,
      description,
      thumbnailUrl,
      introVideoUrl,
      level,
      price: price ?? 0,
      status: finalStatus,
      submittedAt: finalStatus === "pending" ? new Date() : undefined,
      prerequisites: prerequisites || [],
      tags: tags || [],
      valueScore: Math.min(10, Math.max(1, Number(valueScore) || 1)),
    });

    return res.status(201).json({
      message: "Tạo khóa học thành công",
      course,
    });
  } catch (error) {
    console.error("Lỗi khi tạo khóa học", error);

    if (error.code === 11000) {
      return res.status(409).json({ message: "Slug khóa học đã tồn tại" });
    }

    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const getMyCourses = async (req, res) => {
  try {
    const instructorId = req.user._id;
    const courses = await Course.find({ instructorId }).sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Lấy danh sách khóa học của giảng viên thành công",
      courses,
    });
  } catch (error) {
    console.error("Lỗi khi lấy khóa học của giảng viên", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const getMyCourseDetail = async (req, res) => {
  try {
    const { courseId } = req.params;
    const user = req.user;
    const ownershipQuery = getCourseOwnershipQuery(
      courseId,
      user._id,
      user.role,
    );

    const course = await Course.findOne(ownershipQuery);
    if (!course) {
      return res.status(404).json({ message: "Không tìm thấy khóa học" });
    }

    const sortedLessons = [...(course.lessons || [])].sort(
      (firstLesson, secondLesson) =>
        (firstLesson.order || 0) - (secondLesson.order || 0),
    );

    return res.status(200).json({
      message: "Lấy chi tiết khóa học thành công",
      course: {
        ...course.toObject(),
        lessons: sortedLessons,
      },
    });
  } catch (error) {
    console.error("Lỗi khi lấy chi tiết khóa học", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const updateMyCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const user = req.user;
    const ownershipQuery = getCourseOwnershipQuery(
      courseId,
      user._id,
      user.role,
    );

    const course = await Course.findOne(ownershipQuery);
    if (!course) {
      return res.status(404).json({ message: "Không tìm thấy khóa học" });
    }

    // Allow instructors to edit published courses without requiring admin re-approval.
    // Previously we blocked edits to published courses for non-admins; that restriction
    // is removed so instructors can update their published course content directly.

    const originalTitle = course.title;

    const fields = [
      "description",
      "categoryId",
      "thumbnailUrl",
      "introVideoUrl",
      "level",
      "price",
      "prerequisites",
      "tags",
      "valueScore",
    ];

    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        course[field] = req.body[field];
      }
    });

    if (req.body.title && req.body.title.trim() !== originalTitle) {
      const slug = await buildUniqueSlug(req.body.title);
      course.slug = slug;
      course.title = req.body.title.trim();
    } else if (req.body.title !== undefined) {
      course.title = req.body.title.trim();
    }

    // Do not change course.status when instructors edit a published course.

    await course.save();

    return res.status(200).json({
      message: "Cập nhật khóa học thành công",
      course,
    });
  } catch (error) {
    console.error("Lỗi khi cập nhật khóa học", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const submitCourseForReview = async (req, res) => {
  try {
    const { courseId } = req.params;
    const user = req.user;
    const ownershipQuery = getCourseOwnershipQuery(
      courseId,
      user._id,
      user.role,
    );

    const course = await Course.findOne(ownershipQuery);
    if (!course) {
      return res.status(404).json({ message: "Không tìm thấy khóa học" });
    }

    if (!["draft", "rejected"].includes(course.status)) {
      return res.status(400).json({
        message: "Chỉ có thể gửi duyệt từ trạng thái draft hoặc rejected",
      });
    }

    course.status = "pending";
    course.submittedAt = new Date();
    course.rejectedReason = undefined;
    course.approvedBy = undefined;
    course.approvedAt = undefined;
    await course.save();

    return res.status(200).json({
      message: "Đã gửi khóa học lên chờ duyệt",
      course,
    });
  } catch (error) {
    console.error("Lỗi khi gửi duyệt khóa học", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const createLesson = async (req, res) => {
  try {
    const { courseId } = req.params;
    const user = req.user;
    const ownershipQuery = getCourseOwnershipQuery(
      courseId,
      user._id,
      user.role,
    );

    const course = await Course.findOne(ownershipQuery);
    if (!course) {
      return res.status(404).json({ message: "Không tìm thấy khóa học" });
    }

    const {
      title,
      videoUrl,
      duration = 0,
      summary,
      resources = [],
      attachments = [],
      order,
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: "Tiêu đề bài học là bắt buộc" });
    }

    const lessonOrder = Number(order) || (course.lessons?.length || 0) + 1;

    const lesson = {
      title: title.trim(),
      videoUrl: videoUrl || undefined,
      duration: Number(duration) || 0,
      summary: summary || undefined,
      order: lessonOrder,
      resources: Array.isArray(resources) ? resources : [],
      attachments: Array.isArray(attachments) ? attachments : [],
    };

    course.lessons = course.lessons || [];
    course.lessons.push(lesson);
    recalculateCourseLessonStats(course);

    await course.save();

    // Return the last added lesson (with _id)
    const added = course.lessons[course.lessons.length - 1];

    return res
      .status(201)
      .json({ message: "Thêm bài học thành công", lesson: added });
  } catch (error) {
    console.error("Lỗi khi thêm bài học", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const updateLesson = async (req, res) => {
  try {
    const { courseId, lessonId } = req.params;
    const user = req.user;
    const ownershipQuery = getCourseOwnershipQuery(
      courseId,
      user._id,
      user.role,
    );

    const course = await Course.findOne(ownershipQuery);
    if (!course) {
      return res.status(404).json({ message: "Không tìm thấy khóa học" });
    }

    const lesson = course.lessons.id(lessonId);
    if (!lesson) {
      return res.status(404).json({ message: "Không tìm thấy bài học" });
    }

    const {
      title,
      videoUrl,
      duration = 0,
      summary,
      resources = [],
      attachments = [],
      order,
    } = req.body;

    if (title !== undefined) {
      if (!title.trim()) {
        return res.status(400).json({ message: "Tiêu đề bài học là bắt buộc" });
      }

      lesson.title = title.trim();
    }

    if (videoUrl !== undefined) {
      lesson.videoUrl = videoUrl || undefined;
    }

    if (duration !== undefined) {
      lesson.duration = Number(duration) || 0;
    }

    if (summary !== undefined) {
      lesson.summary = summary || undefined;
    }

    if (resources !== undefined) {
      lesson.resources = Array.isArray(resources) ? resources : [];
    }

    if (attachments !== undefined) {
      lesson.attachments = Array.isArray(attachments) ? attachments : [];
    }

    if (order !== undefined) {
      lesson.order = Number(order) || lesson.order;
    }

    recalculateCourseLessonStats(course);
    await course.save();

    return res.status(200).json({
      message: "Cập nhật bài học thành công",
      lesson,
    });
  } catch (error) {
    console.error("Lỗi khi cập nhật bài học", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const deleteLesson = async (req, res) => {
  try {
    const { courseId, lessonId } = req.params;
    const user = req.user;
    const ownershipQuery = getCourseOwnershipQuery(
      courseId,
      user._id,
      user.role,
    );

    const course = await Course.findOne(ownershipQuery);
    if (!course) {
      return res.status(404).json({ message: "Không tìm thấy khóa học" });
    }

    const lesson = course.lessons.id(lessonId);
    if (!lesson) {
      return res.status(404).json({ message: "Không tìm thấy bài học" });
    }

    lesson.deleteOne();
    recalculateCourseLessonStats(course);
    await course.save();

    return res.status(200).json({ message: "Xóa bài học thành công" });
  } catch (error) {
    console.error("Lỗi khi xóa bài học", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const deleteMyCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const user = req.user;
    const ownershipQuery = getCourseOwnershipQuery(
      courseId,
      user._id,
      user.role,
    );

    const course = await Course.findOne(ownershipQuery);
    if (!course) {
      return res.status(404).json({ message: "Không tìm thấy khóa học" });
    }

    await Promise.all([
      CartItem.deleteMany({ courseId: course._id }),
      Enrollment.deleteMany({ courseId: course._id }),
    ]);

    await course.deleteOne();

    return res.status(200).json({ message: "Xóa khóa học thành công" });
  } catch (error) {
    console.error("Lỗi khi xóa khóa học", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};
