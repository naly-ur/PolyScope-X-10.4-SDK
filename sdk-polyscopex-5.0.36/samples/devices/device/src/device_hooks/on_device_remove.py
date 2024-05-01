#!/usr/bin/env python3

from argparse import ArgumentParser
import os
import sys
import logging
from typing import Any
import json

from src.device_hooks._common import (
    log_invocation,
    validate_device_payload,
    remove_owned_device,
)


def main(args):
    """
    This function is called while removing the device. The exit code of this function does not matter.
    """

    # get the information about the added device
    device_data: dict[str, Any] = json.loads(args.json_payload)

    # validate the payload against the schema
    try:
        validate_device_payload(device_data)
    except ValueError as ve:
        logger.error(f"An error occurred while validating the payload: {ve}")
        sys.exit(1)  # payload donot match the schema

    # ensure type always being lowercase
    device_data["urDeviceType"] = device_data.get("urDeviceType", "").lower()

    # remove the device from the list of owned devices
    remove_owned_device(device_data)

    exit(os.EX_OK)


if __name__ == "__main__":
    # set up logging
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        handlers=[logging.StreamHandler(sys.stdout), logging.StreamHandler(sys.stderr)],
    )
    logger = logging.getLogger(__name__)

    parser = ArgumentParser()
    parser.add_argument(
        "json_payload", help="json payload containing device add information"
    )
    args = parser.parse_args()

    # Log the invocation
    log_invocation(sys.argv)

    main(args)
