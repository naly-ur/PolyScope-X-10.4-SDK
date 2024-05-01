from flask import Flask, jsonify, request
import logging
import os

logger = logging.getLogger(__name__)

app = Flask(__name__)


@app.route("/health", methods=["GET"])
def health():
    """
    If you're inside this container:
    curl --location 'http://localhost:8000/health'

    Request via Nginx running on the host machine at port 80:
    curl --location 'http://localhost:80/universal-robots/data-storage-demo/data-storage/flask-server/health'
    """

    logger.info(f"Received request to {request.url}")
    return jsonify({"status": "healthy"}), 200


@app.route("/write_to_file", methods=["POST"])
def write():
    """
    If you're inside this container:
    curl --location 'http://localhost:8000/write_to_file' \
        --header 'Content-Type: application/json' \
        --data '{
            "file_path": "/data/persistent/data.txt",
            "content": "Hello World!"
        }'

    Request via Nginx running on the host machine at port 80:
    curl --location 'http://10.54.254.217:80/universal-robots/data-storage-demo/data-storage/flask-server/write_to_file' \
        --header 'Content-Type: application/json' \
        --data '{
            "file_path": "/data/persistent/data.txt",
            "content": "Hello World!"
        }'
    """

    logger.info(f"Received request to {request.url} with body: {request.get_json()}")

    data = request.get_json()
    if "file_path" not in data or "content" not in data:
        return (
            jsonify({"error": "Request data must include 'file_path' and 'content'"}),
            400,
        )

    file_path = data["file_path"]
    content = data["content"]

    try:
        # 'a+' mode opens the file for both appending and reading.
        # The file is created if it does not exist.
        with open(file_path, "a+") as file:
            file.write(content + "\n")  # append a newline for each write

        logger.info(f"Wrote to file at path: {file_path}")
        return (
            jsonify({"message": f"Successfully wrote to file at path: {file_path}"}),
            200,
        )

    except Exception as e:
        logger.error(
            f"An error occurred when trying to write to file at path: {file_path} -> {str(e)}"
        )
        return jsonify({"error": f"Could not write to file: {str(e)}"}), 500


@app.route("/read_file", methods=["POST"])
def read_file():
    """
    If you're inside this container:
    curl --location 'http://localhost:8000/read_file' \
    --header 'Content-Type: application/json' \
    --data '{
        "file_path": "/data/persistent/data.txt"
    }'

    Request via Nginx running on the host machine at port 80:
    curl --location 'http://localhost:80/universal-robots/data-storage-demo/data-storage/flask-server/read_file' \
        --header 'Content-Type: application/json' \
        --data '{
            "file_path": "/data/persistent/data.txt"
        }'
    """

    data = request.get_json()
    if "file_path" not in data:
        return jsonify({"error": "Request data must include 'file_path'"}), 400

    file_path = data["file_path"]

    if not os.path.exists(file_path):
        logger.error(f"File not found at path: {file_path}")
        return jsonify({"error": f"File not found at path: {file_path}"}), 404

    try:
        with open(file_path, "r") as file:
            content = file.read()

        logger.info(f"Read file at path: {file_path}")
        return jsonify({"content": content}), 200

    except Exception as e:
        logger.error(
            f"An error occurred when trying to read file at path: {file_path} -> {str(e)}"
        )
        return jsonify({"error": f"Could not read file: {str(e)}"}), 500
