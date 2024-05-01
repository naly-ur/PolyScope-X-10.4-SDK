FROM python:3.11-alpine

# Install requirements
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code into Docker image
COPY src .

# Tell Flask where to load the application from
ENV FLASK_APP main.py

# Expose the Flask port
EXPOSE 52762

# Run the REST server
ENTRYPOINT ["flask", "run", "--host", "0.0.0.0", "--port", "52762"]