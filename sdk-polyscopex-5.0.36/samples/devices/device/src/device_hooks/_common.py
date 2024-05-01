from jsonschema import validate
from jsonschema.exceptions import ValidationError
from pathlib import Path
from json import JSONDecodeError
from typing import Dict, Any, List, Sequence
from datetime import datetime
import os

import json

# type aliases for more meaningful typing
UR_DEVICE_TYPE_T = str
DEVICE_UUID_T = str
DEVICE_NODE_PATH_T = str
OWNED_DEVICE_DATA_T = Dict[DEVICE_UUID_T, List[DEVICE_NODE_PATH_T]]


def validate_device_payload(payload_data: Dict[str, Any]) -> None:
    """
    Validate device payload received from your service.
    Raises a ValueError if the payload does not match the schema.
    """
    # Get the current file's path
    current_file_path = os.path.realpath(__file__)

    # Specify the path to the JSON schema file
    schema_file_path = os.path.join(
        os.path.dirname(current_file_path), "device_schema.json"
    )

    # Load JSON Schema
    with open(schema_file_path, "r") as f:
        device_schema = json.load(f)

    try:
        validate(instance=payload_data, schema=device_schema)
    except ValidationError as e:
        raise ValueError(f"Payload does not match schema: {e.message}")


# todo: file locking to prevent race conditions?
def get_log_file_path() -> Path:
    """
    Get the path to the log file for the given device name.
    The name parameter can represent either "on_device_add" or "on_device_remove".
    """
    return Path(f"/tmp/device_invocations.log")


def log_invocation(arguments: Sequence[str]) -> None:
    """
    Log the device invocation details to a file.
    The name parameter can represent either "on_device_add" or "on_device_remove".
    """
    # Get the path to the log file for the specified device name
    log_file_path = get_log_file_path()

    # Open the log file for appending or creating if it doesn't exist
    with log_file_path.open("a", encoding="utf8") as log_file:
        # Get the current timestamp
        timestamp = datetime.now()

        # Join the command-line arguments into a single string
        arguments_str = " ".join(arguments)

        # Write the invocation details to the log file
        log_file.write(f"{timestamp}: {arguments_str}\n")


def get_invocation_log() -> str:
    """
    Get the contents of the on_device_add hook invocation log.
    """
    # Get the path to the log file for the specified device name
    log_file_path = get_log_file_path()

    # Open the log file for reading
    with log_file_path.open("r", encoding="utf8") as log_file:
        # Read the contents of the log file
        invocation_log = log_file.read()

    return invocation_log


def get_owned_devices_file_path(device_type: UR_DEVICE_TYPE_T) -> Path:
    """
    Get the file path for persistently storing the owned devices of a given device type.
    The device_type parameter represents the type of the device (e.g., "serial", "usb").
    """
    return Path(f"/tmp/current_owned_{device_type.lower()}_devices.json")


def fetch_owned_devices() -> OWNED_DEVICE_DATA_T:
    """
    Fetch all owned devices of specified types from their respective files.

    This function collects data about devices that the system currently "owns" or can access.
    It assumes device types as "serial" and "video", and attempts to load their information from
    respective files.

    Returns:
        A dictionary with device UUIDs as keys and associated device nodes as values.
        If no devices of a certain type are owned or the file does not exist or is unreadable,
        no entries of that type will appear in the dictionary.
    """
    # Get the file path for storing the owned devices of the given device type
    LIST_OF_DEVICE_TYPES = ["serial", "video"]
    owned_devices = {}
    for device_type in LIST_OF_DEVICE_TYPES:
        file_path = get_owned_devices_file_path(device_type)
        owned_devices.update(load_owned_devices_from_file(file_path))

    return owned_devices


def fetch_owned_devices_by_type(device_type: UR_DEVICE_TYPE_T) -> OWNED_DEVICE_DATA_T:
    # Get the file path for storing the owned devices of the given device type
    file_path = get_owned_devices_file_path(device_type)

    return load_owned_devices_from_file(file_path)


def load_owned_devices_from_file(file_path: Path) -> OWNED_DEVICE_DATA_T:
    """
    Get all devices that we currently "own", i.e. can access.

    :param file_path: File path for the owned devices data.
    :return: Dictionary of device_uuid: List[device_nodes].
    """
    if not file_path.exists():
        return {}

    with file_path.open("r", encoding="utf8") as fp:
        try:
            return json.load(fp)
        except JSONDecodeError:
            return {}


def generate_device_uuid(device_data: Dict[str, Any]) -> DEVICE_UUID_T:
    """
    Generate a unique device UUID based on vendor, product, and serial.
    The device_data parameter contains the information about the device.
    """
    return device_data["idVendor"] + device_data["idProduct"] + device_data["serial"]


def add_owned_device(device_data: Dict[str, Any]) -> None:
    """
    Persistently save the information that we own this device until URCap restart.
    The device_data parameter contains the information about the added device.
    """

    # Load the current owned devices data
    current_data = fetch_owned_devices_by_type(device_data["urDeviceType"])

    # Generate the device UUID based on vendor, product, and serial
    device_uuid: DEVICE_UUID_T = generate_device_uuid(device_data)

    # Extract the device nodes from the logical devices data
    device_nodes = [
        logical_device["deviceNode"] for logical_device in device_data["logicalDevices"]
    ]

    # Check for duplicate call to /on_device_add for the same device UUID
    assert (
        device_uuid not in current_data.keys()
    ), f"Duplicate call to /on_device_add for device with UUID {device_uuid}"

    # Add the device UUID and its associated device nodes to the current data
    current_data[device_uuid] = device_nodes

    # Write the updated data to the file
    file_path = get_owned_devices_file_path(device_data["urDeviceType"])
    with file_path.open("w", encoding="utf8") as fp:
        json.dump(current_data, fp, indent="  ")


def remove_owned_device(device_data: Dict[str, Any]) -> None:
    """
    Persistently remove the information that we own this device until URCap restart.
    The device_data parameter contains the information about the device to be removed.
    """

    # Load the current owned devices data
    current_data = fetch_owned_devices_by_type(device_data["urDeviceType"])

    # Generate the device UUID based on vendor, product, and serial
    device_uuid = generate_device_uuid(device_data)

    # Check if the device with the UUID exists in the current data
    assert (
        device_uuid in current_data.keys()
    ), f"Device with UUID {device_uuid} should be removed, but was not owned!"

    # Remove the device UUID from the current data
    del current_data[device_uuid]

    # Update the owned devices data file
    file_path = get_owned_devices_file_path(device_data["urDeviceType"])
    with file_path.open("w", encoding="utf8") as fp:
        json.dump(current_data, fp, indent="  ")
