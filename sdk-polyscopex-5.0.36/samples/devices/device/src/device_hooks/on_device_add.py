#!/usr/bin/env python3

import argparse
import json
import logging
import os
import sys
from typing import Any


from src.device_hooks._common import (
    validate_device_payload,
    add_owned_device,
    log_invocation,
)


def accept_device(device_data: dict[str, Any]) -> bool:
    """
    Accept or reject the device based on the device data.
    Return True to accept the device, False to reject it.
    """
    if device_data.get("urDeviceType") != "serial":
        return False

    # you can have some checks on vendor name/version, serial number, etc.
    # to accept or reject the device

    # you can also establish some serial communcation with the device
    # to verify that it is indeed the device you want to accept

    # currently we accept all serial devices
    return True


def main(args: argparse.Namespace) -> None:
    """
    This functon will exit with os.EX_OK(0) if the device is accepted,
    or with a non-zero exit code if the device is rejected.
    """

    # get the information about the added device
    device_data: dict[str, Any] = json.loads(args.json_payload)

    # validate the payload against the schema
    try:
        validate_device_payload(device_data)
    except ValueError as ve:
        logging.error(f"An error occurred while validating the payload: {ve}")
        sys.exit(1)  # payload donot match reject the device, reject the device

    # ensure type always being lowercase
    device_data["urDeviceType"] = device_data.get("urDeviceType", "").lower()

    if not accept_device(device_data):
        # TODO: log info
        sys.exit(1)  # reject the device

    # add the device to the list of owned devices
    add_owned_device(device_data)

    sys.exit(os.EX_OK)


if __name__ == "__main__":
    # set up logging
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        handlers=[logging.StreamHandler(sys.stdout), logging.StreamHandler(sys.stderr)],
    )
    logger = logging.getLogger(__name__)

    logger.info("on_device_add hook invoked")

    # parse command-line arguments
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "json_payload", help="json payload containing device add information"
    )
    args = parser.parse_args()

    # Log the invocation
    log_invocation(sys.argv)

    # Call the main function with the parsed arguments
    main(args)
