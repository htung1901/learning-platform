export const isAdmin = async (req, res, next) => {
  try {
    const user = req.user; // set by protectedRoute middleware

    if (!user) {
      return res.status(401).json({ message: "Không được phép" });
    }

    // kiểm tra role
    if (user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Chỉ admin mới có quyền truy cập" });
    }

    next();
  } catch (error) {
    console.error("Lỗi khi kiểm tra admin", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};
