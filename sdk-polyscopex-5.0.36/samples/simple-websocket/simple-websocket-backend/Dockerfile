FROM python:3.11-alpine

# Install requirements
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code into Docker image
COPY src .

# Expose the port
EXPOSE 52762

# Run the Websocket server specifiyng the host and port
ENTRYPOINT ["python3", "-u", "main.py", "--host", "0.0.0.0", "--port", "52762"]