import pytest
import json
import sys
from unittest.mock import patch, MagicMock, call
from argparse import Namespace

# Import your main script
import src.device_hooks.on_device_add as on_device_add

# python3 -m pytest -s test_on_device_add.py::test_main_valid_payload


def test_main_accepts_device(monkeypatch):
    """
    Test if main function accepts device correctly
    """
    # Mock JSON payload
    json_payload = {
        "idProduct": "0043",
        "idVendor": "2341",
        "logicalDevices": [{"deviceNode": "/dev/ttyACM0", "major": 166, "minor": 0}],
        "manufacturer": "Arduino (www.arduino.cc)",
        "product": "UNKNOWN",
        "serial": "2423831393535101F031",
        "urDeviceType": "SERIAL",
        "urDeviceAPIVersion": "0.1",
    }

    args = Namespace(json_payload=json.dumps(json_payload))

    # Mock the validate_device_payload function to do nothing
    monkeypatch.setattr(on_device_add, "validate_device_payload", lambda x: None)

    # Mock the add_owned_device function to do nothing
    monkeypatch.setattr(on_device_add, "add_owned_device", lambda x: None)

    # Mock the log_invocation function to do nothing
    monkeypatch.setattr(on_device_add, "log_invocation", lambda x: None)

    # Mock sys.exit so it doesn't exit the test
    with patch.object(sys, "exit") as mock_exit:
        on_device_add.main(args)

    # Assert sys.exit was called with 0 (indicating success)
    mock_exit.assert_called_once_with(0)


def test_main_rejects_device(monkeypatch):
    """
    Test if main function rejects device correctly
    """
    # Mock JSON payload
    json_payload = {
        "idProduct": "0044",
        "idVendor": "2342",
        "logicalDevices": [{"deviceNode": "/dev/ttyACM1", "major": 167, "minor": 1}],
        "manufacturer": "Arduino (www.arduino.cc)",
        "product": "UNKNOWN",
        "serial": "2423831393535101F032",
        "urDeviceType": "USB",
        "urDeviceAPIVersion": "0.1",
    }

    args = Namespace(json_payload=json.dumps(json_payload))

    # Mock the validate_device_payload function to do nothing
    monkeypatch.setattr(on_device_add, "validate_device_payload", lambda x: None)

    # Mock the add_owned_device function to return True
    monkeypatch.setattr(on_device_add, "add_owned_device", lambda x: False)

    # Mock the log_invocation function to do nothing
    monkeypatch.setattr(on_device_add, "log_invocation", lambda x: None)

    # Mock sys.exit so it doesn't exit the test
    with patch.object(sys, "exit") as mock_exit:
        on_device_add.main(args)

        # Check if sys.exit was called with 1 and then 0
        # exit(1) is called from add_owned_device, os.EX_OK
        mock_exit.assert_has_calls([call(1), call(0)])


def test_main_validation_error(monkeypatch):
    """
    Test that main function handles the exception raised by validate_device_payload.
    """
    # Mock the payload
    json_payload = '{"urDeviceType": "usb", "otherData": "value"}'

    args = Namespace(json_payload=json_payload)

    # Define a function to raise ValueError
    def raise_value_error(*args, **kwargs):
        raise ValueError("Invalid payload")

    # Mock validate_device_payload function to raise a ValueError
    monkeypatch.setattr(on_device_add, "validate_device_payload", raise_value_error)

    # Mock the add_owned_device function to return True
    monkeypatch.setattr(on_device_add, "add_owned_device", lambda x: True)

    # Mock the log_invocation function to do nothing
    monkeypatch.setattr(on_device_add, "log_invocation", lambda x: None)

    # Mock sys.exit so it doesn't exit the test
    with patch.object(sys, "exit") as mock_exit:
        on_device_add.main(args)

        # Check if sys.exit was called with 1
        # exit(1) is called from validate_device_payload, os.EX_OK
        mock_exit.assert_has_calls([call(1), call(0)])
