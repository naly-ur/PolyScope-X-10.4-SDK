""" XML-RPC Server"""

import argparse
import sys
from xmlrpc.server import SimpleXMLRPCRequestHandler, SimpleXMLRPCServer

from echo.echo import Echo

parser = argparse.ArgumentParser(
    description="Start XML-RPC server for the Simple XML-RPC Sample"
)
parser.add_argument(
    "--ip",
    default="0.0.0.0",
    help="IP adress of the XML-RPC server (default: 0.0.0.0)",
)
parser.add_argument(
    "--port",
    default=12345,
    type=int,
    help="Port number of the XML-RPC server (default: 12345)",
)


# Restrict to a particular path.
class RequestHandler(SimpleXMLRPCRequestHandler):
    """
    Sets the adress of the server
    """

    rpc_paths = ("/",)


def main(args):
    """
    Run the XML-RPC server forever
    """

    server = SimpleXMLRPCServer(
        (args.ip, args.port), requestHandler=RequestHandler, allow_none=True
    )

    # Register system.listMethods, system.methodSignature and system.methodHelp
    server.register_introspection_functions()

    # Register a complete instance of the Echo class for the robot to access
    server.register_instance(Echo())

    # Run the server's main loop
    try:
        print(f"Listening on address: {args.ip}:{args.port}")
        server.serve_forever()
    except KeyboardInterrupt:
        print("Shutting down server")
        server.server_close()
        sys.exit(0)


if __name__ == "__main__":
    arguments = parser.parse_args()
    main(arguments)
