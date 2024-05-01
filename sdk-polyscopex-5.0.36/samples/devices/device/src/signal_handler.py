import signal
import sys


def sigterm_handler(signum, frame):
    # Signal handler for SIGTERM signal
    print("Received SIGTERM signal. Terminating...")

    # Add any cleanup or finalization logic here
    # save any data or state to persistent storage

    # Exit the program gracefully
    sys.exit(0)


def register_signal_handlers():
    # Register the signal handlers for SIGTERM and SIGINT
    signal.signal(signal.SIGTERM, sigterm_handler)  # Register SIGTERM signal handler
    signal.signal(signal.SIGINT, sigterm_handler)  # Register SIGINT signal handler
