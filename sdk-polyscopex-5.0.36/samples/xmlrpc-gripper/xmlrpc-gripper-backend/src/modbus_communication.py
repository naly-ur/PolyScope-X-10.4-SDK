import os, sys, time
import minimalmodbus as modbus
from exceptions import ModbusNotInitialized, ModbusFailedWrite, ModbusFailedRead
from logger import *


MODBUS_DEVICE_ADDRESS = 1     # device address

currentdir = os.path.dirname(os.path.realpath(__file__))
parentdir = os.path.dirname(currentdir)
sys.path.append(parentdir)

instrument = None
log_read_error = True


def init_modbus_communication():
    global instrument
    try:
        instrument = modbus.Instrument('/dev/ur-ttylink/ttyTool', MODBUS_DEVICE_ADDRESS)
    except Exception:
        instrument = None


def tool_modbus_write(register_address, data):
    global instrument
    try:
        check_initialized()
        instrument.write_register(register_address, int(data), 0)
    except Exception as e:
        instrument = None
        Logger.error("Error in modbus write method", exc_info=True)
        raise ModbusFailedWrite("Error in modbus write method") from e


def tool_modbus_read(register_address):
    global log_read_error
    global instrument
    try:
        check_initialized()
        return int(instrument.read_register(register_address, 0))
    except Exception as e:
        instrument = None
        if log_read_error:
            Logger.error("Error in modbus read method", exc_info=True)
        log_read_error = False
        raise ModbusFailedRead("Modbus failed reading") from e


def check_initialized():
    if instrument is None:
        init_modbus_communication()
