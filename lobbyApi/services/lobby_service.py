import uuid
from typing import Dict
from fastapi import WebSocket, HTTPException, Depends

from models.lobby import Lobby


class LobbyService:
    def __init__(self):
        self.lobbies: Dict[str, Lobby] = {}  # {lobby_id: Lobby}

    def generate_lobby_id(self) -> str:
        """Generate a unique lobby ID using UUID."""
        return str(uuid.uuid4())

    def is_lobby_exists(self, lobby_id: str) -> bool:
        """Check if a lobby exists."""
        return lobby_id in self.lobbies

    async def create_lobby(self):
        """Create a new lobby."""
        lobby_id = self.generate_lobby_id()
        self.lobbies[lobby_id] = Lobby(lobby_id)
        return self.lobbies[lobby_id]

    async def delete_lobby(self, lobby_id: str):
        """Delete a lobby and remove all its connections."""
        if not self.is_lobby_exists(lobby_id):
            raise HTTPException(status_code=404, detail="Lobby not found")
        lobby = self.lobbies.pop(lobby_id)
        for player in lobby.players:
            await lobby.remove_websocket_connection(player.player_id)
        return {"message": f"Lobby {lobby_id} deleted successfully"}

    async def add_player(self, lobby_id: str, player_id: str):
        """Add a player to a lobby."""
        if not self.is_lobby_exists(lobby_id):
            raise HTTPException(status_code=404, detail="Lobby not found")
        self.lobbies[lobby_id].add_player(player_id)
        return {"message": f"Player {player_id} added to lobby {lobby_id}"}

    async def get_lobby(self, lobby_id: str):
        if not self.is_lobby_exists(lobby_id):
            raise HTTPException(status_code=404, detail="Lobby not found")
        return await self.lobbies[lobby_id].get_lobby_info()

    async def remove_player(self, lobby_id: str, player_id: str):
        """Remove a player from a lobby."""
        if not self.is_lobby_exists(lobby_id):
            raise HTTPException(status_code=404, detail="Lobby not found")
        self.lobbies[lobby_id].remove_player(player_id)
        return {"message": f"Player {player_id} removed from lobby {lobby_id}"}

    async def add_websocket_connection(self, lobby_id: str, player_id: str, websocket: WebSocket):
        """Add a WebSocket connection for a player."""
        if not self.is_lobby_exists(lobby_id):
            raise HTTPException(status_code=404, detail="Lobby not found")
        await self.lobbies[lobby_id].add_websocket_connection(player_id, websocket)

    async def remove_websocket_connection(self, lobby_id: str, player_id: str):
        """Remove a WebSocket connection for a player."""
        if not self.is_lobby_exists(lobby_id):
            raise HTTPException(status_code=404, detail="Lobby not found")
        await self.lobbies[lobby_id].remove_websocket_connection(player_id)

    async def handle_websocket_message(self, lobby_id: str, websocket: WebSocket, message: dict):
        """Handle WebSocket messages from a player."""
        if not self.is_lobby_exists(lobby_id):
            raise HTTPException(status_code=404, detail="Lobby not found")
        lobby = self.lobbies[lobby_id]

        # Identify the player ID from the WebSocket connection
        player_id = None
        for pid, conn in lobby.websockets.connections.items():
            if conn == websocket:
                player_id = pid
                break

        if not player_id:
            raise HTTPException(status_code=400, detail="Player not found for this WebSocket")

        await lobby.handle_websocket_message(player_id, message)

