import asyncio
import json
import uuid
import websockets

class WebSocketService:
    _instance = None

    def __new__(cls, *args, **kwargs):
        if not cls._instance:
            cls._instance = super().__new__(cls)
        return cls._instance

    def __init__(self):
        if not hasattr(self, "initialized"):
            self.clients = {}  # Store client_id -> websocket
            self.message_handlers = {}
            self.initialized = True

    def register_message_handler(self, message_type, handler):
        self.message_handlers[message_type] = handler

    async def handle_connection(self, websocket, path=None):
        client_id = path.strip("/") if path else str(uuid.uuid4())
        self.clients[client_id] = websocket
        print(f"Client connected: {client_id}")

        try:
            async for message in websocket:
                await self.handle_incoming_message(client_id, websocket, message)
        except websockets.ConnectionClosed:
            print(f"Client disconnected: {client_id}")
            self.clients.pop(client_id, None)

    async def handle_incoming_message(self, client_id, websocket, message):
        try:
            data = json.loads(message)
            handler = self.message_handlers.get(data.get("type"))
            if handler:
                await handler(client_id, websocket, data)
            else:
                print(f"No handler for message type: {data.get('type')}")
        except Exception as e:
            print(f"Error: {e}")

    def broadcast(self, message):
        for ws in self.clients.values():
            asyncio.create_task(ws.send(message))

    async def send_to_client(self, client_id, message):
        ws = self.clients.get(client_id)
        if ws:
            await ws.send(message)
        else:
            print(f"Client {client_id} not found")
