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

export const changeEmailValidator = (req, res, next) => {
  const { newEmail, password } = req.body;
  if (!newEmail || typeof newEmail !== "string") {
    return res.status(400).json({ message: "newEmail là bắt buộc" });
  }
  const emailRe = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
  if (!emailRe.test(newEmail.trim()))
    return res.status(400).json({ message: "Email không hợp lệ" });
  if (!password || typeof password !== "string")
    return res.status(400).json({ message: "password là bắt buộc" });
  next();
};

export const changeUsernameValidator = (req, res, next) => {
  const { newUsername, password } = req.body;
  if (!newUsername || typeof newUsername !== "string")
    return res.status(400).json({ message: "newUsername là bắt buộc" });
  const uname = newUsername.trim();
  if (!/^[A-Za-z0-9_.-]{3,30}$/.test(uname))
    return res.status(400).json({ message: "Username không hợp lệ" });
  if (!password || typeof password !== "string")
    return res.status(400).json({ message: "password là bắt buộc" });
  next();
};
