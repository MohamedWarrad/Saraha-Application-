import { createClient } from "redis";
import { redisConfig } from "../../config/redis.config.js";

export const client = createClient(redisConfig);

export async function connectRedis() {
  try {
    await client.connect();
    console.log(`Redis connection stablish successfully`);
  } catch (error) {
    console.log(`Fail to stablish Redis connection`);
  }
}
