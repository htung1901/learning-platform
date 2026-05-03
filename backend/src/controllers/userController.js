import bcrypt from "bcrypt";
import User from "../models/User.js";

export const authMe = async (req, res) => {
  try {
    const user = req.user;
    return res.status(200).json({ user });
  } catch (error) {
    console.error("Lỗi khi gọi authMe", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// Update current user's profile
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const { displayName, email, phone, bio, avatarUrl, avatarId } = req.body;

    if (!displayName) {
      return res.status(400).json({ message: "displayName là bắt buộc" });
    }

    // Nếu thay đổi email, kiểm tra trùng
    if (email) {
      const existing = await User.findOne({
        email: email.toLowerCase().trim(),
      });
      if (existing && existing._id.toString() !== userId.toString()) {
        return res.status(409).json({ message: "Email đã được sử dụng" });
      }
    }

    const updated = await User.findByIdAndUpdate(
      userId,
      {
        displayName,
        ...(email ? { email: email.toLowerCase().trim() } : {}),
        ...(phone !== undefined ? { phone } : {}),
        ...(bio !== undefined ? { bio } : {}),
        ...(avatarUrl !== undefined ? { avatarUrl } : {}),
        ...(avatarId !== undefined ? { avatarId } : {}),
      },
      { new: true, select: "-hashedPassword" },
    );

    return res.status(200).json({ user: updated });
  } catch (error) {
    console.error("Lỗi khi cập nhật profile", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// Change password for current user
export const changePassword = async (req, res) => {
  try {
    const userId = req.user._id;
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "Cần oldPassword và newPassword" });
    }

    const user = await User.findById(userId).select("+hashedPassword");
    if (!user)
      return res.status(404).json({ message: "Người dùng không tồn tại" });

    const match = await bcrypt.compare(oldPassword, user.hashedPassword);
    if (!match)
      return res.status(401).json({ message: "Mật khẩu hiện tại không đúng" });

    const hashed = await bcrypt.hash(newPassword, 10);
    user.hashedPassword = hashed;
    await user.save();

    return res.sendStatus(204);
  } catch (error) {
    console.error("Lỗi khi đổi mật khẩu", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// Public profile by username (no sensitive info)
export const getPublicProfile = async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username }).select(
      "username displayName avatarUrl bio",
    );
    if (!user)
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    return res.status(200).json({ user });
  } catch (error) {
    console.error("Lỗi khi lấy public profile", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// Toggle instructor mode for current user (toggle between student and instructor)
export const toggleInstructor = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "Người dùng không tồn tại" });
    }

    // Admin cannot toggle role via this endpoint
    if (user.role === "admin") {
      return res
        .status(400)
        .json({ message: "Admin không thể đổi role qua endpoint này" });
    }

    // Toggle between student and instructor
    if (user.role === "student") {
      user.role = "instructor";
    } else if (user.role === "instructor") {
      user.role = "student";
    } else {
      return res.status(400).json({ message: "Không thể thay đổi role" });
    }

    await user.save();

    // Ensure legacy field is removed if present
    await User.updateOne({ _id: userId }, { $unset: { isInstructor: "" } });

    const safe = await User.findById(userId).select("-hashedPassword");
    return res.status(200).json({
      message: `Role cập nhật: ${safe.role}`,
      user: safe,
    });
  } catch (error) {
    console.error("Lỗi khi toggle instructor mode", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// Change email (requires current password)
export const changeEmail = async (req, res) => {
  try {
    const userId = req.user._id;
    const { newEmail, password } = req.body;

    if (!newEmail || !password) {
      return res.status(400).json({ message: "Cần newEmail và password" });
    }

    const user = await User.findById(userId).select("+hashedPassword");
    if (!user)
      return res.status(404).json({ message: "Người dùng không tồn tại" });

    const match = await bcrypt.compare(password, user.hashedPassword);
    if (!match) return res.status(401).json({ message: "Mật khẩu không đúng" });

    const emailNorm = newEmail.toLowerCase().trim();
    const exists = await User.findOne({ email: emailNorm });
    if (exists && exists._id.toString() !== userId.toString()) {
      return res.status(409).json({ message: "Email đã được sử dụng" });
    }

    user.email = emailNorm;
    await user.save();

    const safe = await User.findById(userId).select("-hashedPassword");
    return res.status(200).json({ user: safe });
  } catch (error) {
    console.error("Lỗi khi đổi email", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// Change username (requires current password)
export const changeUsername = async (req, res) => {
  try {
    const userId = req.user._id;
    const { newUsername, password } = req.body;

    if (!newUsername || !password) {
      return res.status(400).json({ message: "Cần newUsername và password" });
    }

    const user = await User.findById(userId).select("+hashedPassword");
    if (!user)
      return res.status(404).json({ message: "Người dùng không tồn tại" });

    const match = await bcrypt.compare(password, user.hashedPassword);
    if (!match) return res.status(401).json({ message: "Mật khẩu không đúng" });

    const uname = newUsername.trim();
    // basic username validation
    if (!/^[a-zA-Z0-9_.-]{3,30}$/.test(uname)) {
      return res.status(400).json({
        message:
          "Username không hợp lệ (3-30 ký tự, chữ hoa/thường, số, _ . -)",
      });
    }

    // Check uniqueness (case-insensitive)
    const exists = await User.findOne({
      username: { $regex: `^${uname}$`, $options: "i" },
    });
    if (exists && exists._id.toString() !== userId.toString()) {
      return res.status(409).json({ message: "Username đã được sử dụng" });
    }

    user.username = uname;
    await user.save();

    const safe = await User.findById(userId).select("-hashedPassword");
    return res.status(200).json({ user: safe });
  } catch (error) {
    console.error("Lỗi khi đổi username", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};
