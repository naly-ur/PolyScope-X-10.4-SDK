#!/usr/bin/env python

import os

from logger import *
from xmlrpc.server import SimpleXMLRPCServer
from xmlrpc.server import SimpleXMLRPCRequestHandler
from socketserver import ThreadingMixIn

if os.path.exists('/dev/ur-ttylink'):
	from modbus_communication import tool_modbus_read, tool_modbus_write
else:
	from modbus_sim import tool_modbus_read, tool_modbus_write


XMLRPC_PORT = 40405

ACTION_ADDRESS = 1
STATUS_ADDRESS = 2
WIDTH_ADDRESS = 3
FORCE_ADDRESS = 4
GRIP_ACTION = 5
RELEASE_ACTION = 6
IS_BUSY_BIT = 1
IS_GRIP_DETECTED_BIT = 2

def grip(width, force):
	try:
		tool_modbus_write(WIDTH_ADDRESS, width)
		tool_modbus_write(FORCE_ADDRESS, force)
		tool_modbus_write(ACTION_ADDRESS, GRIP_ACTION)
		return True
	except Exception:
		return False


def release(width):
	try:
		tool_modbus_write(WIDTH_ADDRESS, width)
		tool_modbus_write(ACTION_ADDRESS, RELEASE_ACTION)
		return True
	except Exception:
		return False


def is_busy():
	try:
		return tool_modbus_read(STATUS_ADDRESS) & GRIPPER_BUSY == GRIPPER_BUSY
	except Exception:
		return False


def is_grip_detected():
	try:
		return tool_modbus_read(STATUS_ADDRESS) & GRIP_DETECTED == GRIP_DETECTED
	except Exception:
		return False

Logger.info(f'Gripper XMLRPC server started on port {XMLRPC_PORT}')


class RequestHandler(SimpleXMLRPCRequestHandler):
	rpc_paths = ('/',)

	def log_message(self, format, *args):
		pass


class MultithreadedSimpleXMLRPCServer(ThreadingMixIn, SimpleXMLRPCServer):
	pass


server = MultithreadedSimpleXMLRPCServer(("0.0.0.0", XMLRPC_PORT), requestHandler=RequestHandler)
server.RequestHandlerClass.protocol_version = "HTTP/1.1"
server.register_function(grip, "grip")
server.register_function(release, "release")
server.register_function(is_busy, "is_busy")
server.register_function(is_grip_detected, "is_grip_detected")
server.serve_forever()
