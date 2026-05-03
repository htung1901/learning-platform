export const isInstructor = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Không được phép" });
    }

    if (!["instructor", "admin"].includes(req.user.role)) {
      return res.status(403).json({ message: "Chỉ giảng viên mới có quyền" });
    }

    next();
  } catch (error) {
    console.error("Lỗi khi kiểm tra quyền giảng viên", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};
