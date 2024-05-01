import logging, sys


class LogFormatter(logging.Formatter):

    green = "\x1b[32;20m"
    grey = "\x1b[38;20m"
    yellow = "\x1b[33;20m"
    red = "\x1b[31;20m"
    bold_red = "\x1b[31;1m"
    reset = "\x1b[0m"
    format1 = "%(asctime)s ["
    format2 = "%(levelname)10s"
    format3 = "] %(message)s"

    FORMATS = {
        logging.DEBUG: format1 + grey + format2 + reset + format3,
        logging.INFO: format1 + green + format2 + reset + format3,
        logging.WARNING: format1 + yellow + format2 + reset + format3,
        logging.ERROR: format1 + red + format2 + reset + format3,
        logging.CRITICAL: format1 + bold_red + format2 + reset + format3,
    }

    def format(self, record):
        log_fmt = self.FORMATS.get(record.levelno)
        formatter = logging.Formatter(fmt=log_fmt, datefmt='%Y/%m/%d %H:%M:%S')
        return formatter.format(record)

Logger = logging.getLogger("Modbus")
handler = logging.StreamHandler(sys.stdout)
handler.setFormatter(LogFormatter())
Logger.addHandler(handler)
Logger.setLevel(logging.INFO)
