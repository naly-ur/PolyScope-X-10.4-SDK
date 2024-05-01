from logger import *

instrument = None
def init_modbus_communication():
    global instrument
    Logger.info('SIMULATOR: Modbus Initialized')
    instrument = 1


def tool_modbus_write(register_address, data):
    global busy_counter
    check_initialized()
    Logger.info(f'SIMULATOR: Writing data = {int(data)} to address = {register_address}')


def tool_modbus_read(register_address):
    check_initialized()
    Logger.info(f'SIMULATOR: Reading register_address {register_address}')
    return register_address


def check_initialized():
    if instrument is None:
        init_modbus_communication()
