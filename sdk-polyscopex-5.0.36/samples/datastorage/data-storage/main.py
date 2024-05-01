from src.rest.api import app
from src.signal_handler import register_signal_handlers

import logging
import os
import sys

# setup root logger
logging.basicConfig(
    level=os.getenv(
        "LOG_LEVEL", "DEBUG"
    ),  # Control log level from environment variable
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",  # Customize the format of your logs
    handlers=[logging.StreamHandler(sys.stdout)],  # Log to stdout
)

# create logger
logger = logging.getLogger(__name__)


def main():
    # register signal handlers
    register_signal_handlers()

    logger.info("Hello World!")

    # start the flask app
    app.run(host="0.0.0.0", port=8000, debug=True)

if __name__ == "__main__":
    main()
