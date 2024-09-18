import express from "express";
import initRedis from "./redis-worker";
const PORT = 3001;

const app = express();

console.log("here is this started");
initRedis();

app.get("/", async (req, res) => {
  res.send("hello from the worker");
});

app.listen(PORT, () => {
  console.log("Video Transcoder Worker started on PORT:", PORT);
});
