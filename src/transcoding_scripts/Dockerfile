# Use a Python 3.10 base image for building
FROM python:3.10-slim-bullseye AS builder

# Install build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    ffmpeg \
    git \
    && rm -rf /var/lib/apt/lists/*

# Install Python packages
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir moviepy awscli && \
    pip install --no-cache-dir torch --index-url https://download.pytorch.org/whl/cpu && \
    pip install --no-cache-dir git+https://github.com/openai/whisper.git

RUN python3 -c "import whisper; whisper.load_model('base')"
# Remove unnecessary files
RUN find /usr/local/lib/python3.10 -name '__pycache__' -type d -exec rm -rf {} +

# Start a new stage
FROM python:3.10-slim-bullseye

# Install runtime dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy Python environment from builder
COPY --from=builder /usr/local /usr/local

# Copy application files
COPY transcoding_shell.sh audio_to_srt.py video_to_audio.py embeed_subtitle_into_video.py /app/

# Make the script executable
RUN chmod +x /app/transcoding_shell.sh

# Set the entrypoint
ENTRYPOINT ["/app/transcoding_shell.sh"]
