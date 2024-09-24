import { createClient, RedisClientType } from "redis";
import dotenv from "dotenv";
dotenv.config();
const redisHost: string = process.env.REDIS_HOST || "localhost"; //if there is redis error in local environmet just change the chess-db to localhost
const redisPassword: string = process.env.REDIS_PASSWORD || ""; //if there is redis error in local environmet just change the chess-db to localhost
const redisPort: number = parseInt(process.env.REDIS_PORT || "6379", 10);
//if there is redis error in local environmet just change the chess-db to localhost

class RedisClient {
  private static instance: RedisClientType | null = null;

  private constructor() {}

  public static getInstance(): RedisClientType {
    if (!RedisClient.instance) {
      RedisClient.instance = createClient({
        password: redisPassword,
        socket: {
          host: redisHost,
          port: redisPort,
        },
      });
      RedisClient.instance.connect().catch(console.error);
    }
    return RedisClient.instance;
  }
}

export default RedisClient;
