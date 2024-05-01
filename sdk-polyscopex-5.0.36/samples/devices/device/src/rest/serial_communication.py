import time
from typing import Optional
from serial import Serial

import logging

logger = logging.getLogger(__name__)


def receive_data(serial_port, deadline, msg_len):
    """
    Receives data from the serial port until it has received `msg_len` bytes or the `deadline` is passed.

    Args:
        serial_port (Serial): An opened serial port to read from.
        deadline (float): The time.time() value after which receiving should be stopped.
        msg_len (int): The number of bytes expected to receive.

    Returns:
        bytes: The received bytes.

    Raises:
        TimeoutError: If the deadline is exceeded before all data is received.
    """
    n_bytes_to_receive_remaining = msg_len
    result = b""
    while n_bytes_to_receive_remaining > 0:
        if time.time() > deadline:
            logger.error("Timed out while trying to receive echoed characters.")
            raise TimeoutError("Timed out while trying to receive echoed characters.")

        read_bytes = serial_port.read(size=serial_port.in_waiting)
        result += read_bytes
        n_bytes_to_receive_remaining -= len(read_bytes)

    return result


def try_serial_echo_connection(
    device: str = "/dev/ttyACM0",
    baud: int = 115200,
    timeout_s: float = 1.0,
    sent_msg: bytes = b"test_message",
    expected_msg: bytes = b"test_message OK",
    reset_delay_s: Optional[float] = None,
) -> bytes:
    """
    Try to establish a serial connection to the specified device, send a message,
    and wait for a response. Raise a TimeoutError if a response is not received within
    the specified timeout.

    Parameters:
    - device: Name of the device to connect to
    - baud: Baud rate for the connection
    - timeout_s: Time to wait for a response before raising a TimeoutError
    - sent_msg: Message to send to the device
    - expected_msg: Expected message to receive from the device
    - reset_delay_s: Time to wait for the device to reset before sending the message

    Returns:
    - The message received from the device
    """
    with Serial(device, baud, timeout=timeout_s) as ser:
        # Wait for the device to reset if a reset delay is specified
        if reset_delay_s is not None:
            time.sleep(reset_delay_s)

        logger.info(f"Sending message: {sent_msg}")
        # Send the message
        ser.write(sent_msg)
        logger.info("Message sent.")

        # Wait for a response
        deadline = time.time() + timeout_s
        result = receive_data(ser, deadline, len(expected_msg))

        return result.strip()
