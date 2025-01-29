from fastapi import WebSocket
from typing import Dict, Callable, Optional

from models.message import Message


class WebSocketService:
    def __init__(self):
        self.connections: Dict[str, WebSocket] = {}  # Stores connections by player ID
        self.message_handlers: Dict[str, Callable[[str, dict], None]] = {}  # Handlers for message types

    async def add_connection(self, player_id: str, websocket: WebSocket):
        """Add a player's WebSocket connection."""
        self.connections[player_id] = websocket

    async def remove_connection(self, player_id: str):
        """Remove a player's WebSocket connection."""
        if player_id in self.connections:
            del self.connections[player_id]

    async def send_to_all(self, message: dict):
        """Send a message to all connected players."""
        for websocket in self.connections.values():
            try:
                await websocket.send_json(message)
            except Exception as e:
                print(f"Failed to send message to all: {e}")

    async def send_to_all_except(self, player_id: str, message: dict):
        for websocket in self.connections.values():
            if websocket != self.connections.get(player_id):
                try:
                    await websocket.send_json(message)
                except Exception as e:
                    print(f"Failed to send message to all: {e}")

    async def send_to_player(self, player_id: str, message: dict):
        """Send a message to a specific player."""
        websocket = self.connections.get(player_id)
        if websocket:
            try:
                await websocket.send_json(message)
            except Exception as e:
                print(f"Failed to send message to player {player_id}: {e}")
        else:
            print(f"Player {player_id} is not connected.")

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
        await self.send_to_player(player_id, {"error": error_message})
