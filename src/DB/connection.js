import mongoose from "mongoose";
import envConfig from "../config/env.config.js";

const connectDB = async () => {
  try {
    await mongoose.connect(envConfig.database.uri);
    console.log(`DB connected successfully!`);
  } catch (error) {
    console.log(`DB failed to connect ${error.message}`);
  }
};

export default connectDB;
