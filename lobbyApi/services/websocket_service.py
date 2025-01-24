from fastapi import WebSocket
from typing import Dict

class WebSocketService:
    def __init__(self):
        # This stores connections by player ID within each lobby
        self.connections: Dict[str, WebSocket] = {}

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
