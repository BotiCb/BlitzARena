import websockets
import asyncio
import json
import uuid  # Import uuid to generate unique client IDs

class WebSocketService:
    def __init__(self):
        self.clients = {}  # Store clients as a dictionary of client_id -> websocket
        self.message_handlers = {}

    def register_message_handler(self, message_type, handler):
        self.message_handlers[message_type] = handler

    async def handle_connection(self, websocket, path=None):
        # If the path is None or empty, generate a unique client_id
        client_id = path.strip("/") if path else str(uuid.uuid4())  # Fallback to UUID if path is None

        # Register the client
        self.clients[client_id] = websocket
        print(f"New connection established: {client_id}")

        try:
            async for message in websocket:
                await self.handle_incoming_message(client_id, websocket, message)
        except websockets.ConnectionClosed as e:
            print(f"Connection closed for {client_id}: {e}")
            self.clients.pop(client_id, None)  # Remove the client from the list on disconnect

    async def handle_incoming_message(self, client_id, websocket, message):
        try:
            parsed_message = json.loads(message)
            message_type = parsed_message.get("type")
            handler = self.message_handlers.get(message_type)

            if handler:
                # Call the handler with parsed message and websocket
                await handler(client_id, websocket, parsed_message)
            else:
                print(f"No handler found for message type: {message_type}")
        except Exception as e:
            print(f"Error handling message from {client_id}: {e}")

    def send_message_to_all(self, message):
        # Broadcast message to all connected clients
        for client_id, client_ws in self.clients.items():
            asyncio.create_task(client_ws.send(message))

    async def send_message_to_client(self, client_id, message):
        # Send a message to a specific client
        client_ws = self.clients.get(client_id)
        if client_ws:
            await client_ws.send(message)
        else:
            print(f"Client {client_id} not connected")