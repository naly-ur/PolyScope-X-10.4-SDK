# Base image
FROM python:3.11-slim-bullseye

# Set working directory
WORKDIR /macvlan

# Copy the project files into the container
COPY . /macvlan

# Install dependencies
RUN apt-get update \
    && apt-get install -y curl iproute2 iputils-ping\
    && rm -rf /var/lib/apt/lists/*

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Run the Flask server
CMD ["python", "main.py"]