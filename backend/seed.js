import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import User from "./src/models/User.js";

dotenv.config();

const ADMIN_CREDENTIALS = {
  username: "admin",
  password: "Admin@123",
  email: "admin@example.com",
  displayName: "Admin User",
};

async function createAdminUser() {
  try {
    // Kết nối database
    await mongoose.connect(process.env.MONGODB_CONNECTIONSTRING);
    console.log("✓ Kết nối database thành công");

    // Hash password
    const hashedPassword = await bcrypt.hash(ADMIN_CREDENTIALS.password, 10);

    // Kiểm tra admin đã tồn tại
    let admin = await User.findOne({ username: "admin" });
    if (admin) {
      console.log("✓ Admin user đã tồn tại (không cần thay đổi role)");
    } else {
      // Tạo admin user mới
      admin = await User.create({
        username: ADMIN_CREDENTIALS.username,
        hashedPassword,
        email: ADMIN_CREDENTIALS.email,
        displayName: ADMIN_CREDENTIALS.displayName,
        role: "admin",
      });
      console.log("✓ Admin user được tạo thành công!");
    }

    console.log("✓ Admin user được tạo thành công!");
    console.log("  Username:", ADMIN_CREDENTIALS.username);
    console.log("  Password:", ADMIN_CREDENTIALS.password);
    console.log("  Email:", ADMIN_CREDENTIALS.email);
    console.log("\n⚠️  Vui lòng đổi mật khẩu sau lần đăng nhập đầu tiên!");

    process.exit(0);
  } catch (error) {
    console.error("✗ Lỗi:", error.message);
    process.exit(1);
  }
}

createAdminUser();
