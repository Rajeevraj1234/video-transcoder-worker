import initTranscoding from "../worker";
import axios from "axios";
import RedisClient from "../redis/index"; // Set to "nextnode" if you encounter module resolution errors
const client = RedisClient.getInstance();
import dotenv from "dotenv";
dotenv.config();

const QUEUE_NAME = "transcodingData"; // Define your queue name here
const POLL_INTERVAL_MS = 1000; // Polling interval

async function addMoveToDbFromRedis() {
  while (true) {
    let parsedData;
    try {
      // Use BRPOP to wait for an element to be available
      const data = await client.brPop(QUEUE_NAME, 0); // 0 means to block indefinitely (block until new element comes in)
      parsedData = JSON.parse(data?.element || "");
      if (data) {
        await initTranscoding(parsedData);
      } else {
        await axios.post(`${process.env.FRONTEND_URL}`, {
          message: "Data is not present",
          success: false,
        });
      }
    } catch (error) {
      await axios.post(`${process.env.FRONTEND_URL}`, {
        message: "Video did not uploaded successfully",
        success: false,
      });
      console.error("Error occured in RER", error);
    }
    //sen message that process has been completed
    await axios.post(`${process.env.FRONTEND_URL}`, {
      message: "Video upload successfully",
      success: true,
      data: parsedData,
    });

    // Add a delay before the next BRPOP call, if needed
    // This helps to avoid excessive CPU usage in case of errors or other issues
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
  }
}

function initRedis() {
  addMoveToDbFromRedis();
}

export default initRedis;
