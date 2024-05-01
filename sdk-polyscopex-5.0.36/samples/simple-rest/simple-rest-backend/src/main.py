"""Main flask module for simple REST URCap Sample"""

import json

import flask
from flask import Flask, request
from flask_cors import CORS


def create_response(data: dict):
    """
    Creates a Flask response object with JSON data.

    Args:
        data (dict): The JSON data to include in the response body.

    Returns:
        flask.Response: A Flask response object with the specified JSON data.
    """
    resp = flask.make_response()
    resp.headers["Content-Type"] = "application/json"
    resp.data = json.dumps(data)
    return resp


app = Flask(__name__)
app.debug = True
CORS(app)


@app.route("/get-example", methods=["GET"])
def get_example():
    """Sends a hardcoded JSON blob

    Returns:
        flask.Response: A Flask response object with the specified JSON data.
    """
    app.logger.info("GET Example")

    return create_response({"get_test": "Hello Client from Server"})


@app.route("/post-example", methods=["POST"])
def post_example():
    """Echos the payload directly back to the client

    Returns:
        flask.Response: A Flask response object with the specified JSON data.
    """
    app.logger.info("POST Example")
    payload = request.get_json()

    return create_response(payload)
