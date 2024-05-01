import random


def init_serial_communication(serial_path):
    print('SIMULATOR: Initializing serial communication at %s' % serial_path)


def serial_write(data):
    print('SIMULATOR: Writing data = "%d"' % int(data))


def serial_read():
    return random.randint(0, 10)