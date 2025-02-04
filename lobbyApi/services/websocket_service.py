from fastapi import WebSocket
from typing import Dict, Callable, Optional

from models.message import Message
from utils.dto_convention_converter import convert_dict_to_camel_case


class WebSocketService:
    def __init__(self):
        self.connections: Dict[str, WebSocket] = {}  # Stores connections by player ID
        self.message_handlers: Dict[str, Callable[[str, dict], None]] = {}
        self.register_handler('ping', self.pong)

    async def add_connection(self, player_id: str, websocket: WebSocket):
        """Add a player's WebSocket connection."""
        self.connections[player_id] = websocket

    async def remove_connection(self, player_id: str):
        """Remove a player's WebSocket connection."""
        if player_id in self.connections:
            del self.connections[player_id]

    async def send_to_player(self, player_id: str, message: Message):
        """Send a Message instance to a specific player."""
        websocket = self.connections.get(player_id)
        if websocket:
            try:
                message_dict = convert_dict_to_camel_case(message.to_dict())
                await websocket.send_json(message_dict)
            except Exception as e:
                print(f"Failed to send message to player {player_id}: {e}")

    async def send_to_all(self, message: Message):
        """Send a Message instance to all connected players."""
        message_dict = convert_dict_to_camel_case(message.to_dict())
        for websocket in self.connections.values():
            try:
                await websocket.send_json(message_dict)
            except Exception as e:
                print(f"Failed to send message to all: {e}")

    async def send_to_all_except(self, player_id: str, message: Message):
        """Send a Message instance to all except specified player."""
        message_dict = convert_dict_to_camel_case(message.to_dict())
        for pid, websocket in self.connections.items():
            if pid != player_id:
                try:
                    await websocket.send_json(message_dict)
                except Exception as e:
                    print(f"Failed to send message to {pid}: {e}")

    def register_handler(self, message_type: str, handler: Callable[[str, dict], None]):
        """Register a handler for a specific message type."""
        if message_type in self.message_handlers:
            raise ValueError(f"Handler for message type '{message_type}' already exists")
        self.message_handlers[message_type] = handler

    async def handle_message(self, player_id: str, message: Message):
        """Dispatch a message to the appropriate handler."""
        handler = self.message_handlers[message.type]
        if not handler:
            await self._send_error(player_id, f"No handler found for message type '{message.type}'.")
            return

        try:
            # Pass only the data part to the handler
            await handler(player_id, message.data)
        except Exception as e:
            print(f"Error handling message from player {player_id}: {e}")
            await self._send_error(player_id, error_message=str(e))

    async def _send_error(self, player_id: str, error_message: str):
        """Send an error message to a player."""
        await self.send_to_player(player_id, Message({"type": "error", "data": error_message}))

    async def pong(self, player_id: str, message: dict):
        timestamp = message.get("timestamp")
        if timestamp is not None:
            await self.send_to_player(player_id, Message({"type": "pong", "data": {"timestamp": timestamp}}))
