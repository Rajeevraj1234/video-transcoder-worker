"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
//import { db } from "../db";
const worker_1 = __importDefault(require("../worker"));
const index_1 = __importDefault(require("../redis/index")); // Set to "nextnode" if you encounter module resolution errors
const client = index_1.default.getInstance();
const QUEUE_NAME = "transcodingData"; // Define your queue name here
const POLL_INTERVAL_MS = 1000; // Polling interval
function addMoveToDbFromRedis() {
    return __awaiter(this, void 0, void 0, function* () {
        while (true) {
            try {
                // Use BRPOP to wait for an element to be available
                const data = yield client.brPop(QUEUE_NAME, 0); // 0 means to block indefinitely (block until new element comes in)
                const parsedData = JSON.parse((data === null || data === void 0 ? void 0 : data.element) || "");
                console.log("parsed data is here", parsedData);
                if (data) {
                    yield (0, worker_1.default)(parsedData);
                }
                else {
                    console.log("Unexpected error: No data returned");
                }
            }
            catch (error) {
                console.error("Error occurred in Game/addMoveToDb", error);
            }
            // Add a delay before the next BRPOP call, if needed
            // This helps to avoid excessive CPU usage in case of errors or other issues
            yield new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
        }
    });
}
function initRedis() {
    addMoveToDbFromRedis();
}
exports.default = initRedis;
