#!/bin/sh

# Download the video from S3
aws s3 cp $INPUT_URL input.mp4

wait 

#when user only want to transcode the video file
if [ "$OPTION" = "TRANS" ]; then
  # Transcode to 360p, 480p, and 720p
  ffmpeg -threads 2 -i input.mp4 -vf "scale=640:360" -c:v libx264 -crf 23 -preset fast -c:a aac output_360p.mp4
  ffmpeg -threads 2 -i input.mp4 -vf "scale=854:480" -c:v libx264 -crf 23 -preset fast -c:a aac output_480p.mp4
  ffmpeg -threads 2 -i input.mp4 -vf "scale=1280:720" -c:v libx264 -crf 23 -preset fast -c:a aac output_720p.mp4

  wait
  # Upload the transcoded videos to S3
  aws s3 cp output_360p.mp4 s3://$AWS_S3_BUCKET_NAME/$OUTPUT_KEY_360P
  aws s3 cp output_480p.mp4 s3://$AWS_S3_BUCKET_NAME/$OUTPUT_KEY_480P
  aws s3 cp output_720p.mp4 s3://$AWS_S3_BUCKET_NAME/$OUTPUT_KEY_720P 

  rm input.mp4 output_360p.mp4 output_480p.mp4 output_720p.mp4 

elif [ "$OPTION" = "SUB" ]; then #when use want to add subtitle

  python3 video_to_audio.py || { echo "Video to Audio conversion failed"; exit 1; }
  python3 audio_to_srt.py || { echo "Audio to subtitle file conversion failed"; exit 1; }
  python3 embeed_subtitle_into_video.py || { echo "embedding the subtitle into the video failed"; exit 1; }

  aws s3 cp input_with_subtitle.mp4 s3://$AWS_S3_BUCKET_NAME/$FILE_KEY 
  rm input_with_subtitle.mp4 input.mp4 
else
  # adding subtitle to the input video file
  python3 video_to_audio.py || { echo "Video to Audio conversion failed"; exit 1; }
  python3 audio_to_srt.py || { echo "Audio to subtitle file conversion failed"; exit 1; }
  python3 embeed_subtitle_into_video.py || { echo "embedding the subtitle into the video failed"; exit 1; }


  # Transcode to 360p, 480p, and 720p
  ffmpeg -threads 2 -i input_with_subtitle.mp4 -vf "scale=640:360,subtitles=subtitles.srt" -c:v libx264 -crf 23 -preset fast -c:a aac output_360p.mp4
  ffmpeg -threads 2 -i input_with_subtitle.mp4 -vf "scale=854:480,subtitles=subtitles.srt" -c:v libx264 -crf 23 -preset fast -c:a aac output_480p.mp4
  ffmpeg -threads 2 -i input_with_subtitle.mp4 -vf "scale=1280:720,subtitles=subtitles.srt" -c:v libx264 -crf 23 -preset fast -c:a aac output_720p.mp4

  wait

  # Upload the transcoded videos to S3
  aws s3 cp output_360p.mp4 s3://$AWS_S3_BUCKET_NAME/$OUTPUT_KEY_360P
  aws s3 cp output_480p.mp4 s3://$AWS_S3_BUCKET_NAME/$OUTPUT_KEY_480P
  aws s3 cp output_720p.mp4 s3://$AWS_S3_BUCKET_NAME/$OUTPUT_KEY_720P 


  # Clean up
  rm input.mp4 output_360p.mp4 output_480p.mp4 output_720p.mp4 audio.wav subtitles.srt input_with_subtitle.mp4
fi

