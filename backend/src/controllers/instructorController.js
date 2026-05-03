import Course from "../models/Course.js";

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

    if (course.status === "published" && user.role !== "admin") {
      return res
        .status(400)
        .json({ message: "Khóa học đã xuất bản không thể sửa trực tiếp" });
    }

    const fields = [
      "title",
      "description",
      "categoryId",
      "thumbnailUrl",
      "introVideoUrl",
      "level",
      "price",
      "prerequisites",
      "tags",
    ];

    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        course[field] = req.body[field];
      }
    });

    if (req.body.title && req.body.title.trim() !== course.title) {
      const slug = await buildUniqueSlug(req.body.title);
      course.slug = slug;
      course.title = req.body.title.trim();
    }

    if (course.status === "published" && user.role === "admin") {
      course.status = "draft";
    }

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
