import { spawn } from "child_process";
import dotenv from "dotenv";
dotenv.config();
interface videoData {
  fileKey: string;
  option: string;
  userId: string;
  videoId: string;
}

async function initTranscoding(data: videoData) {
  const inputUrl = `s3://${process.env.AWS_S3_BUCKET_NAME}/${data.fileKey}`; //s3 url for the downloading of the video
  const outputKey360p = `${data.fileKey.split(".")[0]}_360p.mp4`;
  const outputKey480p = `${data.fileKey.split(".")[0]}_480p.mp4`;
  const outputKey720p = `${data.fileKey.split(".")[0]}_720p.mp4`;

  const dockerCmd = `sudo docker run --rm -e INPUT_URL=${inputUrl} -e OPTION=${data.option} -e FILE_KEY=${data.fileKey} -e OUTPUT_KEY_360P=${outputKey360p} -e OUTPUT_KEY_480P=${outputKey480p} -e OUTPUT_KEY_720P=${outputKey720p} -e AWS_S3_BUCKET_NAME=${process.env.AWS_S3_BUCKET_NAME} -e AWS_ACCESS_KEY_ID=${process.env.AWS_S3_ACCESS_KEY_ID} -e AWS_SECRET_ACCESS_KEY=${process.env.AWS_S3_SECRET_ACCESS_KEY} transcoding-docker`;

  console.log("Docker container started ==================> ");

  const timeout = 1200000; // 10 minutes (adjust as necessary)

  await new Promise<void>((resolve, reject) => {
    const process = spawn(dockerCmd, { shell: true });

    let timedOut = false;
    let stdoutData = "";
    let stderrData = "";

    const timer = setTimeout(() => {
      timedOut = true;
      process.kill();
      reject(new Error("Transcoding process timed out"));
    }, timeout);

    process.stdout.on("data", (data) => {
      stdoutData += data.toString(); //using this i get the output in chunks which is helpfull for longer process and the process.on("close") does not have to wait till everything is done which let to the error of no resolving the issue        console.log(`stdout: ${data}`);
    });

    process.stderr.on("data", (data) => {
      stderrData += data.toString(); // Accumulate stderr data
      console.error(`stderr: ${data}`);
    });

    process.on("close", (code) => {
      clearTimeout(timer);
      if (!timedOut) {
        console.log("code is:", code);
        if (code === 0) {
          resolve();
        } else {
          console.error("stderr output:", stderrData);
          reject(new Error(`Transcoding failed with code ${code}`));
        }
      }
    });
  });

  console.log("Docker container ended ===================> ");
  let transcoded_res;
  let response = {
    success: true,
  };
  if (data.option === "SUB") {
    response = {
      success: true,
    };
  } else {
    //docker url files
    const url360p = `https://${process.env.AWS_CLOUDFRONT_DOMAIN}/${outputKey360p}`;
    const url480p = `https://${process.env.AWS_CLOUDFRONT_DOMAIN}/${outputKey480p}`;
    const url720p = `https://${process.env.AWS_CLOUDFRONT_DOMAIN}/${outputKey720p}`;

    //transcoded_res = await prisma.transcoded_video_metadata.create({
    //  data: {
    //    videoId: data.videoId,
    //    userId: data.userId,
    //    url360: url360p,
    //    url480: url480p,
    //    url720: url720p,
    //    videoType:
    //      data.option === "TRANS" ? "TRANSCODED" : "TRANSCODED_AND_SUBTITLED",
    //    createdAt: new Date(),
    //  },
    //});
    //response = {
    //  success: true,
    //  urls: {
    //    url360p,
    //    url480p,
    //    url720p,
    //  },
    //};
  }
  if (response) {
    return response;
  } else {
    return {
      success: false,
      error: "trancoding failed due to some server error",
    };
  }
}

export default initTranscoding;
