"""Simple WebSocket Server Script"""

import argparse
import asyncio
import json

import websockets

parser = argparse.ArgumentParser()
parser.add_argument("--host", type=str, default="localhost")
parser.add_argument("--port", type=int, default=9090)


async def handler(websocket):
    """Handler for receiving message"""
    async for message in websocket:
        # Print the received event from the client
        event = json.loads(message)
        print(f"Received event: {event}")

        # Send a response event back to the client
        event = {"response": "Hello World from Server"}
        print(f"Sending event back: {json.dumps(event)}")
        await websocket.send(json.dumps(event))


async def main(args):
    """Main entrance"""
    # Create a WebSocket server
    async with websockets.serve(handler, args.host, args.port):
        print(f"WebSocket server started on {args.host}:{args.port}")

        # Wait for connections
        await asyncio.Future()  # Run forever

if __name__ == '__main__':
    # Start the server
    asyncio.run(main(parser.parse_args()))
