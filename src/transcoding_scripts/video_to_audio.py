from moviepy.editor import VideoFileClip

# Load video
video = VideoFileClip("input.mp4")

# Extract and save audio
video.audio.write_audiofile("audio.wav")
