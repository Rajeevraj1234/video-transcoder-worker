//import { db } from "../db";
import initTranscoding from "../worker";
import RedisClient from "../redis/index"; // Set to "nextnode" if you encounter module resolution errors
const client = RedisClient.getInstance();

const QUEUE_NAME = "transcodingData"; // Define your queue name here
const POLL_INTERVAL_MS = 1000; // Polling interval

async function addMoveToDbFromRedis() {
  while (true) {
    try {
      // Use BRPOP to wait for an element to be available
      const data = await client.brPop(QUEUE_NAME, 0); // 0 means to block indefinitely (block until new element comes in)
      const parsedData = JSON.parse(data?.element || "");
      console.log("parsed data is here", parsedData);
      if (data) {
        await initTranscoding(parsedData);
      } else {
        console.log("Unexpected error: No data returned");
      }
    } catch (error) {
      console.error("Error occurred in Game/addMoveToDb", error);
    }

    // Add a delay before the next BRPOP call, if needed
    // This helps to avoid excessive CPU usage in case of errors or other issues
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
  }
}

function initRedis() {
  addMoveToDbFromRedis();
}

export default initRedis;
