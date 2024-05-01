import flask
from flask import Flask, request
from flask_cors import CORS

data_file = "/mount/data.txt"

def read_from_file():
    file = open(data_file, "r")
    return file.read()


def write_to_file(data):
    file = open(data_file, "w")
    file.write(data)
    file.close()


# Write default data
write_to_file("Default Data!")

# Create a simple rest api with Flask (https://flask.palletsprojects.com/en/2.0.x/)
app = Flask(__name__)
CORS(app)


@app.route("/", methods=["GET"])
def read_data():
    resp = create_response()
    resp.data = read_from_file()
    return resp


@app.route("/", methods=["POST"])
def write_data():
    resp = create_response()
    json = request.get_json()
    write_to_file(json.get("data"))
    return resp


def create_response():
    resp = flask.make_response()
    resp.headers['Content-Type'] = 'text/plain'
    return resp
