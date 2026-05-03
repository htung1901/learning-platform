import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../src/models/User.js";

dotenv.config();

async function migrate() {
  try {
    await mongoose.connect(process.env.MONGODB_CONNECTIONSTRING);
    console.log("Connected to DB");

    // Users that had isInstructor true should become role 'instructor'
    const res1 = await User.updateMany(
      { isInstructor: true, role: { $ne: "instructor" } },
      { $set: { role: "instructor" } },
    );
    console.log(`Updated roles for ${res1.modifiedCount} users`);

    // Remove isInstructor field from all users
    const res2 = await User.updateMany(
      { isInstructor: { $exists: true } },
      { $unset: { isInstructor: "" } },
    );
    console.log(`Removed isInstructor field from ${res2.modifiedCount} users`);

    console.log("Migration completed");
    process.exit(0);
  } catch (err) {
    console.error("Migration error:", err);
    process.exit(1);
  }
}

migrate();
