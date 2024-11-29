import asyncio
import websockets
import json
async def echo(websocket, path=None):  # Define a default path argument
    print(f"New connection established. Path: {path}")
    try:
        async for message in websocket:
            print(f"Received: {message}")
            data = {
                "type": "training-start",
                "content": "Hello, how are you?",
                "sender": "user123"
            }
            await websocket.send(json.dumps(data))
    except websockets.ConnectionClosed as e:
        print(f"Connection closed: {e}")

# Start WebSocket server
async def start_server():
    print("Starting WebSocket server")
    # Ensure the 'echo' handler is passed here
    server = await websockets.serve(echo, "192.168.1.41", 8765)
    await server.wait_closed()
