# api.py
from flask import Flask, jsonify, request
from src.device_hooks._common import (
    fetch_owned_devices_by_type,
    fetch_owned_devices,
    get_invocation_log,
)
from src.rest.serial_communication import try_serial_echo_connection

import logging

logger = logging.getLogger(__name__)

app = Flask(__name__)


@app.route("/alive", methods=["GET"])
def is_alive():
    return "I am alive!"


@app.route("/owned_devices", methods=["GET"])
def get_owned_devices_by_type():
    """
    GET /owned_devices?device_type={device_type}

    Retrieve owned devices filtered by a specific type. If 'device_type' query parameter is not
    provided, it retrieves all owned devices.

    Returns a JSON response containing a dictionary of devices owned by type.

    Example curl command:
    # If you're inside the container:
    curl --location 'http://localhost:8000/owned_devices?device_type=<my_device_type>'

    # If you're on the host machine:
    curl --location 'http://localhost:80/universal-robots/devices-demo/device/rest-api/owned_devices?device_type=serial'
    """

    # Get the "device_type" query parameter from the URL.
    # If it's not provided, this will be None.

    device_type = request.args.get("device_type")
    if device_type is not None:
        logger.info(f"Received device_type: {device_type}")
        device_type = device_type.lower()

    LIST_OF_DEVICE_TYPES = ["serial", "video"]
    owned_devices = {}
    if device_type is not None and device_type not in LIST_OF_DEVICE_TYPES:
        message = f"Invalid device type. Must be one of {LIST_OF_DEVICE_TYPES}"
        return jsonify({"message": message}), 400
    elif device_type is not None:
        owned_devices = fetch_owned_devices_by_type(device_type)
    else:
        owned_devices = fetch_owned_devices()

    return jsonify(owned_devices), 200


@app.route("/invocation_logs", methods=["GET"])
def get_on_device_add_hook_invocation_log():
    """
    GET /invocation_logs

    Retrieve the contents of the on_device_add hook invocation log.

    Returns a JSON response containing the contents of the on_device_add hook invocation log.

    Example curl command:
    # If you're inside the container:
    curl --location 'http://localhost:8000/invocation_logs'

    # If you're on the host machine:
    curl --location 'http://localhost:80/universal-robots/devices-demo/device/rest-api/invocation_logs'
    """

    invocation_log = get_invocation_log()

    return jsonify({"invocation_log": invocation_log}), 200


@app.route("/serial/echo", methods=["GET"])
def serial_echo():
    """
    POST /serial/echo

    Tries to establish a serial connection to the specified device, send a message,
    and expect a response.

    This function expects a JSON request with the following keys:
    'device' - Device name, defaults to "/dev/ttyACM0"
    'baud' - Baud rate, defaults to 115200
    'timeout_s' - Timeout in seconds, defaults to 1.0
    'sent_msg' - Message to be sent, defaults to "test_message"
    'expected_msg' - Expected message to receive, required
    'reset_delay_s' - Reset delay in seconds, no default value

    If the function successfully sends the message and receives the expected response
    within the specified timeout, it will return a 200 status with a JSON response: {"success": True}
    If it encounters an error, it will return a 500 status with a JSON response: {"success": False, "error": error message}

    Example curl command:
    # If you're inside the container:
    curl --location --request GET 'http://localhost:8080/serial/echo' \
        --header 'Content-Type: application/json' \
        --data '{"device": "/dev/ttyUSB0", "baud": 115200, "timeout_s": 10.0, "sent_msg": "hello world", "expected_msg": "hello world OK", "reset_delay_s": 0.5}'

    # If you're on the host machine (replace 'localhost' and '8080' with your machine's IP and port):
    curl --location --request GET 'http://localhost:80/universal-robots/devices-demo/device/rest-api/serial/echo' \
        --header 'Content-Type: application/json' \
        --data '{"device": "/dev/ttyUSB0", "baud": 115200, "timeout_s": 10.0, "sent_msg": "hello world", "expected_msg": "hello world OK", "reset_delay_s": 0.5}'    
    """

    # Parse JSON request data
    data = request.get_json()

    # Unpack data with default values
    device = data.get("device", "/dev/ttyACM0")
    baud = data.get("baud", 115200)
    timeout_s = data.get("timeout_s", 1.0)
    sent_msg = data.get("sent_msg", "test_message").encode()
    expected_msg = data.get("expected_msg", "test_message OK").encode()
    reset_delay_s = data.get("reset_delay_s", 0)

    logger.info(
        f"Received device: {device}, baud: {baud}, timeout: {timeout_s}, sent message: {sent_msg}, expected message: {expected_msg}, reset delay: {reset_delay_s}"
    )

    # Try to make echo connection
    try:
        recied_msg = try_serial_echo_connection(
            device, baud, timeout_s, sent_msg, expected_msg, reset_delay_s
        )
        if recied_msg is None:
            logger.info("No response received")
            return jsonify({"success": False, "error": "No response received"}), 500
        elif recied_msg != expected_msg:
            logger.info(
                f"Received message: {recied_msg} does not match expected message: {expected_msg}"
            )
            return (
                jsonify(
                    {
                        "success": False,
                        "error": f"Received message: {recied_msg} does not match expected message: {expected_msg}",
                    }
                ),
                500,
            )
        else:
            return jsonify({"success": True}), 200
    except Exception as e:  # Catch any exceptions that might be thrown by the function
        return jsonify({"success": False, "error": str(e)}), 500
