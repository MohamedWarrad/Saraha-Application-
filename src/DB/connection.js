import mongoose from "mongoose";
import envConfig from "../config/env.config.js";
import { connectRedis } from "../common/clients/redis.client.js";
import { dbConfig } from "../config/db.config.js";

const connectDB = async () => {
  try {
    await mongoose.connect(dbConfig);
    console.log(`DB connected successfully!`);
    await connectRedis();
  } catch (error) {
    console.log(`DB failed to connect ${error.message}`);
  }
};

export default connectDB;
