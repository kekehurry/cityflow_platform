# Use a base image with Docker pre-installed
FROM docker:latest

# Install Python and pip
RUN apk add --no-cache python3 py3-pip docker-cli

# Set the working directory
WORKDIR /workspace

# Copy the application code
COPY . .

# Create a virtual environment and install the required packages
RUN python3 -m venv venv && \
    ./venv/bin/pip install --upgrade pip && \
    ./venv/bin/pip install -r requirements.txt

# Expose the application port
EXPOSE 8000

# Command to keep the container running
CMD ["./venv/bin/python", "server.py"]
