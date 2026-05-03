import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../src/models/User.js";

dotenv.config();

async function dump() {
  try {
    await mongoose.connect(process.env.MONGODB_CONNECTIONSTRING);
    const user = await User.findOne({ username: "testteacher" }).lean();
    console.log(user);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

dump();
