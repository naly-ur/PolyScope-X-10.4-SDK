import json
import pytest
from unittest.mock import patch, mock_open, MagicMock
from jsonschema import ValidationError
from typing import Dict, Any, Sequence
from pathlib import Path
from datetime import datetime


# Import your function
from src.device_hooks._common import (
    validate_device_payload,
    add_owned_device,
    remove_owned_device,
    log_invocation,
    get_log_file_path,
)

# python3 -m pytest -s src/device_hooks/test_common.py::test_validate_device_payload_valid


@pytest.mark.parametrize(
    "valid_payload",
    [
        {
            "idProduct": "0043",
            "idVendor": "2341",
            "logicalDevices": [
                {"deviceNode": "/dev/ttyACM0", "major": 166, "minor": 0}
            ],
            "manufacturer": "Arduino (www.arduino.cc)",
            "product": "UNKNOWN",
            "serial": "2423831393535101F031",
            "urDeviceType": "SERIAL",
            "urDeviceAPIVersion": "0.1",
        },
        {
            "idProduct": "6001",
            "idVendor": "0403",
            "logicalDevices": [
                {"deviceNode": "/dev/ttyUSB0", "major": 188, "minor": 0}
            ],
            "manufacturer": "FTDI",
            "product": "USB-RS485 Cable",
            "serial": "AU064DZK",
            "urDeviceType": "SERIAL",
            "urDeviceAPIVersion": "0.1",
        },
        # unknow key
        {
            "unknowKey": "some_data_type",
            "idProduct": "0043",
            "idVendor": "2341",
            "logicalDevices": [
                {"deviceNode": "/dev/ttyACM0", "major": 166, "minor": 0}
            ],
            "manufacturer": "Arduino (www.arduino.cc)",
            "product": "UNKNOWN",
            "serial": "2423831393535101F031",
            "urDeviceType": "SERIAL",
            "urDeviceAPIVersion": "0.1",
        },
    ],
)
def test_validate_device_payload_valid(valid_payload):
    # Load your actual schema
    with open("src/device_hooks/device_schema.json", "r") as f:
        device_schema = json.load(f)

    # Mocking the open function to return a predefined schema
    # This way, your function won't actually read from a file
    schema_mock_open = mock_open(read_data=json.dumps(device_schema))

    with patch("builtins.open", schema_mock_open):
        # Testing with valid payload - should not raise exception
        try:
            validate_device_payload(valid_payload)
        except ValidationError:
            pytest.fail("validate_device_payload raised ValidationError unexpectedly!")


@pytest.mark.parametrize(
    "invalid_payload",
    [
        # logicalDevices key missing
        {
            "idProduct": "0043",
            "idVendor": "2341",
            "manufacturer": "Arduino (www.arduino.cc)",
            "product": "UNKNOWN",
            "serial": "2423831393535101F031",
            "urDeviceType": "SERIAL",
            "urDeviceAPIVersion": "0.1",
        },
        # major version invalid data type
        {
            "idProduct": "0043",
            "idVendor": "2341",
            "logicalDevices": [
                {"deviceNode": "/dev/ttyACM0", "major": "major", "minor": 0}
            ],
            "manufacturer": "Arduino (www.arduino.cc)",
            "product": "UNKNOWN",
            "serial": "2423831393535101F031",
            "urDeviceType": "SERIAL",
            "urDeviceAPIVersion": "0.1",
        },
        # unknow key
        {"InvalidKey": "anotherInvalidValue"},
    ],
)
def test_validate_device_payload_invalid(invalid_payload):
    # Load your actual schema
    with open("src/device_hooks/device_schema.json", "r") as f:
        device_schema = json.load(f)

    # Mocking the open function to return a predefined schema
    # This way, your function won't actually read from a file
    schema_mock_open = mock_open(read_data=json.dumps(device_schema))

    with patch("builtins.open", schema_mock_open):
        # Testing with invalid payload - should raise ValueError
        with pytest.raises(ValueError):
            validate_device_payload(invalid_payload)


def test_get_log_file_path():
    # Test with hook_name = "on_device_add"
    log_file_path = get_log_file_path()
    assert isinstance(log_file_path, Path)
    assert str(log_file_path) == "/tmp/device_invocations.log"

    # Test with hook_name = "on_device_remove"
    log_file_path = get_log_file_path()
    assert isinstance(log_file_path, Path)
    assert str(log_file_path) == "/tmp/device_invocations.log"


def test_log_invocation(tmpdir):
    # Create a mock log file in the temporary directory
    mock_log_file_path = tmpdir.join("device_invocations.log")

    # Define the arguments that will be logged
    arguments = [
        "/on_device_add",
        '{"idProduct":"0043","idVendor":"2341","logicalDevices":[{"deviceNode":"/dev/ttyACM0","major":166,"minor":0}],"manufacturer":"Arduino (www.arduino.cc)","product":"UNKNOWN","serial":"2423831393535101F031","urDeviceType":"SERIAL","urDeviceAPIVersion":"0.1"}',
    ]

    # Mock the get_log_file_path function to return the mock log file path
    with patch(
        "src.device_hooks._common.get_log_file_path",
        return_value=Path(mock_log_file_path),
    ):
        log_invocation(arguments)

    # Check if the log_invocation function wrote the arguments to the file correctly
    with open(mock_log_file_path, "r") as log_file:
        log_content = log_file.read()

        # Format the arguments to match the format used by the log_invocation function
        arguments_str = " ".join(arguments)

        # Check if the file contains the arguments
        assert arguments_str in log_content

        # Check if the file contains the timestamp
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        assert timestamp in log_content


def test_add_owned_device(tmpdir):
    # Create a mock JSON file in the temporary directory
    mock_json_file_path = tmpdir.join("current_owned_devices.json")

    # Define multiple sets of device data to be added
    device_data_list = [
        {
            "idProduct": "0043",
            "idVendor": "2341",
            "logicalDevices": [
                {"deviceNode": "/dev/ttyACM0", "major": 166, "minor": 0}
            ],
            "manufacturer": "Arduino (www.arduino.cc)",
            "product": "UNKNOWN",
            "serial": "2423831393535101F031",
            "urDeviceType": "SERIAL",
            "urDeviceAPIVersion": "0.1",
        },
        {
            "idProduct": "0044",
            "idVendor": "2342",
            "logicalDevices": [
                {"deviceNode": "/dev/ttyACM1", "major": 167, "minor": 1}
            ],
            "manufacturer": "Arduino (www.arduino.cc)",
            "product": "UNKNOWN",
            "serial": "2423831393535101F032",
            "urDeviceType": "SERIAL",
            "urDeviceAPIVersion": "0.1",
        },
    ]

    # Mock the get_owned_devices_file_path function to return the mock JSON file path
    with patch(
        "src.device_hooks._common.get_owned_devices_file_path",
        return_value=Path(mock_json_file_path),
    ):
        # Mock the fetch_owned_devices_by_type function to return an empty dictionary
        with patch(
            "src.device_hooks._common.fetch_owned_devices_by_type", return_value={}
        ):
            # Add each device from the device_data_list
            for device_data in device_data_list:
                add_owned_device(device_data)

    # Check if the add_owned_device function added all devices to the JSON file correctly
    with open(mock_json_file_path, "r") as json_file:
        # '234100432423831393535101F031': ['/dev/ttyACM0'], '234200442423831393535101F032': ['/dev/ttyACM1']}
        file_content = json.load(json_file)

        for device_data in device_data_list:
            # Generate the device UUID based on vendor, product, and serial
            # device_uuid = device_data["idVendor"] + device_data["idProduct"] + device_data["serial"]
            device_uuid = (
                device_data["idVendor"]
                + device_data["idProduct"]
                + device_data["serial"]
            )

            # Extract the device nodes from the logical devices data
            device_nodes = [
                logical_device["deviceNode"]
                for logical_device in device_data["logicalDevices"]
            ]

            assert device_uuid in file_content
            assert file_content[device_uuid] == device_nodes


def test_remove_owned_device(tmpdir):
    # Create a mock JSON file in the temporary directory
    mock_json_file_path = tmpdir.join("current_owned_devices.json")

    # Define the device data that will be removed
    device_data = {
        "idProduct": "0043",
        "idVendor": "2341",
        "logicalDevices": [{"deviceNode": "/dev/ttyACM0", "major": 166, "minor": 0}],
        "manufacturer": "Arduino (www.arduino.cc)",
        "product": "UNKNOWN",
        "serial": "2423831393535101F031",
        "urDeviceType": "SERIAL",
        "urDeviceAPIVersion": "0.1",
    }

    # Generate the device UUID based on vendor, product, and serial
    device_uuid = (
        device_data["idVendor"] + device_data["idProduct"] + device_data["serial"]
    )

    # Extract the device nodes from the logical devices data
    device_nodes = [
        logical_device["deviceNode"] for logical_device in device_data["logicalDevices"]
    ]

    owned_devices = {device_uuid: device_nodes}

    # Write the initial owned devices to the mock JSON file
    with open(mock_json_file_path, "w") as json_file:
        json.dump(owned_devices, json_file)

    # Mock the get_owned_devices_file_path function to return the mock JSON file path
    with patch(
        "src.device_hooks._common.get_owned_devices_file_path",
        return_value=Path(mock_json_file_path),
    ):
        # Mock the fetch_owned_devices_by_type function to return the owned_devices dictionary
        with patch(
            "src.device_hooks._common.fetch_owned_devices_by_type",
            return_value=owned_devices,
        ):
            remove_owned_device(device_data)

    # Check if the remove_owned_device function removed the device from the JSON file correctly
    with open(mock_json_file_path, "r") as json_file:
        file_content = json.load(json_file)

        assert device_uuid not in file_content
