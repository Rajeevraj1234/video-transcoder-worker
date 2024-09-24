"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const redis_1 = require("redis");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const redisHost = process.env.REDIS_HOST || "localhost"; //if there is redis error in local environmet just change the chess-db to localhost
const redisPassword = process.env.REDIS_PASSWORD || ""; //if there is redis error in local environmet just change the chess-db to localhost
const redisPort = parseInt(process.env.REDIS_PORT || "6379", 10);
//if there is redis error in local environmet just change the chess-db to localhost
class RedisClient {
    constructor() { }
    static getInstance() {
        if (!RedisClient.instance) {
            RedisClient.instance = (0, redis_1.createClient)({
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
RedisClient.instance = null;
exports.default = RedisClient;
