# Stage 1: Slim Python + JDK image
FROM python:3.11-slim

# Install OpenJDK (headless for smaller image)
RUN apt-get update && \
    apt-get install -y --no-install-recommends default-jdk-headless && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Create non-root user for execution
RUN useradd -m -s /bin/bash judge

WORKDIR /app

# Copy and install dependencies first (Docker layer caching)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . /app

# Set ownership
RUN chown -R judge:judge /app

EXPOSE 8000

# Run as non-root user
USER judge

# Use multiple workers for concurrent execution
CMD ["python", "main.py"]
