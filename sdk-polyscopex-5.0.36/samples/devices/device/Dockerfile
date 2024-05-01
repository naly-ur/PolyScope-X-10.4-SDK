FROM python:3.11-slim-bullseye

WORKDIR /usr/src/app

RUN apt-get update \
    && apt-get install -y libusb-1.0-0 curl \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# assign executable permissions to the scripts /usr/src/app/src/device_hooks/on_device_add.py
RUN chmod +x /usr/src/app/src/device_hooks/on_device_add.py && \
    chmod +x /usr/src/app/src/device_hooks/on_device_remove.py

# Create a symlink in /
RUN ln -s /usr/src/app/src/device_hooks/on_device_add.py /on_device_add && \
    ln -s /usr/src/app/src/device_hooks/on_device_remove.py /on_device_remove

# Set PYTHONPATH
ENV PYTHONPATH="${PYTHONPATH}:/usr/src/app/src"

# Expose the required port
EXPOSE 8000

# Run the Flask server
CMD ["python", "main.py"]