import os
import subprocess

input_video = "input.mp4"
subtitle_file = "subtitles.srt"
output_video = "input_with_subtitle.mp4"

if not os.path.exists(subtitle_file):
    print(f"Subtitle file {subtitle_file} not found!")
else:
    command = [
        'ffmpeg',
        '-i', input_video,
        '-vf', f'subtitles={subtitle_file}',
        '-c:a', 'copy',
        output_video
    ]

    subprocess.run(command)
