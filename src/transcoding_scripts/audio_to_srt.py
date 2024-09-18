import whisper
from datetime import timedelta

# Load the Whisper model
model = whisper.load_model("base")

# Transcribe the audio to text with timestamps
result = model.transcribe("audio.wav")

# Extract segments from the transcription result
segments = result['segments']

def format_time(seconds):
    """Format seconds into SRT timestamp format."""
    millis = int((seconds - int(seconds)) * 1000)
    return f"{int(seconds // 3600):02}:{int((seconds % 3600) // 60):02}:{int(seconds % 60):02},{millis:03}"

def write_srt(segments, output_file="subtitles.srt"):
    """Write the transcription segments to an SRT file."""
    with open(output_file, 'w') as file:
        for i, segment in enumerate(segments, 1):
            start = segment['start']
            end = segment['end']
            text = segment['text']
            file.write(f"{i}\n")
            file.write(f"{format_time(start)} --> {format_time(end)}\n")
            file.write(f"{text}\n\n")

# Write the subtitles to an SRT file
write_srt(segments)