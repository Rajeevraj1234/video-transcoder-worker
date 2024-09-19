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
const worker_1 = __importDefault(require("../worker"));
const axios_1 = __importDefault(require("axios"));
const index_1 = __importDefault(require("../redis/index")); // Set to "nextnode" if you encounter module resolution errors
const client = index_1.default.getInstance();
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const QUEUE_NAME = "transcodingData"; // Define your queue name here
const POLL_INTERVAL_MS = 1000; // Polling interval
function addMoveToDbFromRedis() {
    return __awaiter(this, void 0, void 0, function* () {
        while (true) {
            let parsedData;
            try {
                // Use BRPOP to wait for an element to be available
                const data = yield client.brPop(QUEUE_NAME, 0); // 0 means to block indefinitely (block until new element comes in)
                parsedData = JSON.parse((data === null || data === void 0 ? void 0 : data.element) || "");
                if (data) {
                    yield (0, worker_1.default)(parsedData);
                }
                else {
                    yield axios_1.default.post(`${process.env.FRONTEND_URL}`, {
                        message: "Data is not present",
                        success: false,
                    });
                }
            }
            catch (error) {
                yield axios_1.default.post(`${process.env.FRONTEND_URL}`, {
                    message: "Video did not uploaded successfully",
                    success: false,
                });
                console.error("Error occured in RER", error);
            }
            //sen message that process has been completed
            yield axios_1.default.post(`${process.env.FRONTEND_URL}`, {
                message: "Video upload successfully",
                success: true,
                data: parsedData,
            });
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
