from fastapi import WebSocket, HTTPException
from typing import Dict, Callable


class WebSocketService:
    def __init__(self):
        # This stores connections by player ID within each lobby
        self.connections: Dict[str, WebSocket] = {}
        self.message_handlers: Dict[str, Callable[[str, dict], None]] = {}

    async def add_connection(self, player_id: str, websocket: WebSocket):
        """Add a player's WebSocket connection."""
        self.connections[player_id] = websocket

    async def remove_connection(self, player_id: str):
        """Remove a player's WebSocket connection."""
        if player_id in self.connections:
            del self.connections[player_id]

    async def send_to_all(self, message: dict):
        """Send a message to all players in the lobby."""
        for websocket in self.connections.values():
            await websocket.send_json(message)

    async def send_to_player(self, player_id: str, message: dict):
        """Send a message to a specific player."""
        if player_id in self.connections:
            await self.connections[player_id].send_json(message)
        else:
            print(f"Player {player_id} not connected")


    def register_handler(self, message_type: str, handler: Callable[[str, dict], None]):
            """Register a handler for a specific message type."""
            if message_type in self.message_handlers:
                raise ValueError(f"Handler for message type '{message_type}' already exists")
            self.message_handlers[message_type] = handler

    async def handle_message(self, player_id: str, message: dict):
        """Dispatch a message to the appropriate handler."""
        if(message == None):
            await self.send_to_player(player_id, {"message": "empty message received"})
        message_type = message.get("type")
        if not message_type:
           await self.send_to_player(player_id, {"message": "type field is required"})
        handler = self.message_handlers.get(message_type)
        if not handler:
            await self.send_to_player(player_id, {"message": f"Handler for message type '{message_type}' not found"})
            return
        await handler(player_id, message)
