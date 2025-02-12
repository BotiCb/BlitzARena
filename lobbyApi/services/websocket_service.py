import asyncio
from typing import Dict, Callable, Optional, Coroutine, Any, List

from fastapi import WebSocket
from models.message import Message
from utils.dto_convention_converter import convert_dict_to_camel_case


class WebSocketService:
    def __init__(self):
        self.connections: Dict[str, WebSocket] = {}  # Stores connections by player ID
        self.message_handlers: Dict[str, Callable[[str, dict], Coroutine[Any, Any, None]]] = {}
        self.message_queue: asyncio.Queue[Message] = asyncio.Queue()  # Queue for outgoing messages
        self.register_handler('ping', self.pong)
        asyncio.create_task(self.process_message_queue())  # Start processing the message queue

    async def add_connection(self, player_id: str, websocket: WebSocket):
        """Add a player's WebSocket connection."""
        self.connections[player_id] = websocket

    async def remove_connection(self, player_id: str):
        """Remove a player's WebSocket connection."""
        if player_id in self.connections:
            del self.connections[player_id]

    async def send_to_player(self, player_id: str, message: Message):
        """Send a Message instance to a specific player."""
        self.message_queue.put_nowait((player_id, message))  # Add message to the queue

    async def send_to_all(self, message: Message):
        """Send a Message instance to all connected players."""
        for player_id in self.connections.keys():
            self.message_queue.put_nowait((player_id, message))  # Add message to the queue for each player

    async def send_to_all_except(self, player_id: str, message: Message):
        """Send a Message instance to all except specified player."""
        for pid in self.connections.keys():
            if pid != player_id:
                self.message_queue.put_nowait((pid, message))  # Add message to the queue for each player

    async def send_to_group(self, player_ids: List[str], message: Message):
        """Send a Message instance to a group of players."""
        for player_id in player_ids:
            self.message_queue.put_nowait((player_id, message))  # Add message to the queue for each player

    async def process_message_queue(self):
        """Process the message queue asynchronously."""
        while True:
            player_id, message = await self.message_queue.get()
            websocket = self.connections.get(player_id)
            if websocket:
                try:
                    message_dict = convert_dict_to_camel_case(message.to_dict())
                    await websocket.send_json(message_dict)
                    if message.type != "pong":
                        print(f"Sent message to {player_id}: {message.type}")
                except Exception as e:
                    print(f"Failed to send message to player {player_id}: {e}")
            self.message_queue.task_done()

    def register_handler(self, message_type: str, handler: Callable[[str, dict], Coroutine[Any, Any, None]]):
        print(f"Registered handler for message type '{message_type}'")
        """Register a handler for a specific message type."""
        if message_type in self.message_handlers:
            raise ValueError(f"Handler for message type '{message_type}' already exists")
        self.message_handlers[message_type] = handler

    def unregister_handler(self, message_type: str):
        if message_type in self.message_handlers:
            print(f"Unregistered handler for message type '{message_type}'")
            del self.message_handlers[message_type]

    async def handle_message(self, player_id: str, message: Message):
        try:
            """Dispatch a message to the appropriate handler."""
            handler = self.message_handlers[message.type]
            if message.type != "ping":
                print(f"Received message from player {player_id}: {message.type} - {message.data}")
            await handler(player_id, message.data)

        except KeyError as e:
            print(f"No handler found for message type '{message.type}': {e}")
            await self.send_error(player_id, f"No handler found for message type '{message.type}'.")

        except Exception as e:
            print(f"Error handling message from player {player_id}: {e}")
            await self.send_error(player_id, error_message=str(e))

    async def send_error(self, player_id: str, error_message: str):
        """Send an error message to a player."""
        await self.send_to_player(player_id, Message({"type": "error", "data": error_message}))

    async def pong(self, player_id: str, message: dict):
        timestamp = message.get("timestamp")
        if timestamp is not None:
            await self.send_to_player(player_id, Message({"type": "pong", "data": {"timestamp": timestamp}}))