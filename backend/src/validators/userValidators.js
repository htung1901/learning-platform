// Simple express validation middleware for user profile endpoints

export const updateProfileValidator = (req, res, next) => {
  const { displayName, email, phone, bio } = req.body;

  if (
    !displayName ||
    typeof displayName !== "string" ||
    displayName.trim().length === 0
  ) {
    return res
      .status(400)
      .json({ message: "displayName là bắt buộc và phải là chuỗi" });
  }

  if (email && typeof email === "string") {
    const e = email.trim().toLowerCase();
    // simple email check
    const emailRe = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
    if (!emailRe.test(e))
      return res.status(400).json({ message: "Email không hợp lệ" });
    req.body.email = e;
  }

  if (phone && typeof phone !== "string") {
    return res.status(400).json({ message: "Phone phải là chuỗi" });
  }

  if (bio && typeof bio !== "string") {
    return res.status(400).json({ message: "Bio phải là chuỗi" });
  }

  next();
};

export const changePasswordValidator = (req, res, next) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || typeof oldPassword !== "string") {
    return res.status(400).json({ message: "oldPassword là bắt buộc" });
  }

  if (
    !newPassword ||
    typeof newPassword !== "string" ||
    newPassword.length < 6
  ) {
    return res
      .status(400)
      .json({ message: "newPassword cần tối thiểu 6 ký tự" });
  }

  next();
};
