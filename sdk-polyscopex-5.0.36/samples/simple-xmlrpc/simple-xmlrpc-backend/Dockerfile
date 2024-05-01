FROM python:3.11-alpine

# Copy application code into Docker image
COPY src src/

# Expose the Flask port
EXPOSE 12345

# Run the REST service
ENTRYPOINT ["python", "-u", "src/xmlrpc_server.py", "--ip", "0.0.0.0", "--port", "12345"]
