import sys
import logging
from src.signal_handler import register_signal_handlers
from src.rest.api import app


def configure_logging():
    """
    Configure logging for the application.
    """

    # Set level of root logger to INFO
    logging.getLogger().setLevel(logging.INFO)

    # Create a StreamHandler for stdout
    stdout_handler = logging.StreamHandler(sys.stdout)

    # Set level of the stdout_handler to INFO
    stdout_handler.setLevel(logging.INFO)

    # Format your logs
    formatter = logging.Formatter(
        "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    )
    stdout_handler.setFormatter(formatter)

    # Add stdout_handler to root logger
    logging.getLogger().addHandler(stdout_handler)

    # Remove the default Flask logging handler
    for handler in app.logger.handlers:
        if isinstance(handler, logging.StreamHandler) and handler is not stdout_handler:
            app.logger.removeHandler(handler)


def main():
    # Register signal handlers
    register_signal_handlers()

    # Configure logging
    configure_logging()

    # Start the app
    app.run(host="0.0.0.0", port=8000, debug=True)

    logging.info("Application started")


if __name__ == "__main__":
    main()
