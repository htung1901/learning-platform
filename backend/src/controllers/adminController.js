import Course from "../models/Course.js";
import User from "../models/User.js";
import Enrollment from "../models/Enrollment.js";

// Lấy danh sách khóa học chờ duyệt
export const getPendingCourses = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const courses = await Course.find({ status: "pending" })
      .populate("instructorId", "username displayName email")
      .sort({ submittedAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Course.countDocuments({ status: "pending" });

    return res.status(200).json({
      message: "Lấy danh sách khóa học chờ duyệt thành công",
      data: courses,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách khóa học chờ duyệt", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// Duyệt khóa học
export const approveCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const adminId = req.user._id; // từ middleware

    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({ message: "Khóa học không tồn tại" });
    }

    if (course.status !== "pending") {
      return res
        .status(400)
        .json({ message: "Chỉ có thể duyệt khóa học ở trạng thái chờ duyệt" });
    }

    // cập nhật course
    course.status = "published";
    course.approvedBy = adminId;
    course.approvedAt = new Date();
    await course.save();

    return res.status(200).json({
      message: "Đã duyệt khóa học thành công",
      data: course,
    });
  } catch (error) {
    console.error("Lỗi khi duyệt khóa học", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// Từ chối khóa học
export const rejectCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { reason } = req.body;
    const adminId = req.user._id;

    if (!reason) {
      return res.status(400).json({ message: "Phải cung cấp lý do từ chối" });
    }

    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({ message: "Khóa học không tồn tại" });
    }

    if (course.status !== "pending") {
      return res.status(400).json({
        message: "Chỉ có thể từ chối khóa học ở trạng thái chờ duyệt",
      });
    }

    // cập nhật course
    course.status = "rejected";
    course.rejectedReason = reason;
    course.approvedBy = adminId;
    course.approvedAt = new Date();
    await course.save();

    return res.status(200).json({
      message: "Đã từ chối khóa học",
      data: course,
    });
  } catch (error) {
    console.error("Lỗi khi từ chối khóa học", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// Lấy thống kê cho admin dashboard
export const getAdminStats = async (req, res) => {
  try {
    // tổng số user
    const totalUsers = await User.countDocuments();
    const instructors = await User.countDocuments({ role: "instructor" });
    const students = await User.countDocuments({ role: "student" });

    // tổng số khóa học
    const totalCourses = await Course.countDocuments();
    const publishedCourses = await Course.countDocuments({
      status: "published",
    });
    const pendingCourses = await Course.countDocuments({ status: "pending" });
    const rejectedCourses = await Course.countDocuments({
      status: "rejected",
    });

    // tổng số enrollment
    const totalEnrollments = await Enrollment.countDocuments();

    // khóa học phổ biến nhất
    const topCourses = await Course.find({ status: "published" })
      .sort({ totalStudents: -1 })
      .limit(5)
      .select("title totalStudents totalLessons price");

    return res.status(200).json({
      message: "Lấy thống kê admin thành công",
      data: {
        users: {
          total: totalUsers,
          instructors,
          students,
        },
        courses: {
          total: totalCourses,
          published: publishedCourses,
          pending: pendingCourses,
          rejected: rejectedCourses,
        },
        enrollments: totalEnrollments,
        topCourses,
      },
    });
  } catch (error) {
    console.error("Lỗi khi lấy thống kê admin", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// Lấy tất cả user (để admin quản lý)
export const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const role = req.query.role; // filter by role nếu có

    const query = {};
    if (role && ["student", "instructor", "admin"].includes(role)) {
      query.role = role;
    }

    const users = await User.find(query)
      .select("-hashedPassword")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(query);

    return res.status(200).json({
      message: "Lấy danh sách user thành công",
      data: users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách user", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// Thay đổi role của user (chỉ admin)
export const updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!role || !["student", "instructor", "admin"].includes(role)) {
      return res.status(400).json({ message: "Role không hợp lệ" });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true, runValidators: true },
    ).select("-hashedPassword");

    if (!user) {
      return res.status(404).json({ message: "Người dùng không tồn tại" });
    }

    return res.status(200).json({
      message: "Cập nhật role người dùng thành công",
      data: user,
    });
  } catch (error) {
    console.error("Lỗi khi cập nhật role user", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};
