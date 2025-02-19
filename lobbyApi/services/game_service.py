import uuid
from typing import Dict
from fastapi import WebSocket, HTTPException

from game.game_instance import GameInstance
from models.message import Message


class GameService:
    def __init__(self):
        self.games: Dict[str, GameInstance] = {}  # {game_id: Lobby}

    def generate_game_id(self) -> str:

        """Generate a unique game ID using UUID."""
        return str(uuid.uuid4())

    def is_game_exists(self, game_id: str) -> bool:
        """Check if a game exists."""
        return game_id in self.games

    async def create_game(self, data: dict):

        """Create a new game."""
        max_players = data.get("max_players", 0)
        if max_players <= 0:
            raise HTTPException(status_code=400, detail="Max players must be greater than 0")
        game_id = self.generate_game_id()
        self.games[game_id] = GameInstance(game_id, max_players)
        return self.games[game_id]

    async def delete_game(self, game_id: str):
        """Delete a game and remove all its connections."""
        if not self.is_game_exists(game_id):
            raise HTTPException(status_code=404, detail="Lobby not found")
        game = self.games.pop(game_id)
        for player in game.players:
            await game.remove_websocket_connection(player.player_id)
        return {"message": f"Lobby {game_id} deleted successfully"}

    async def add_player(self, game_id: str, player_id: str):
        """Add a player to a game."""
        await self.get_game(game_id).add_player(player_id)
        return {"message": f"Player {player_id} added to game {game_id}"}

    def get_game(self, game_id: str) -> GameInstance:
        if not self.is_game_exists(game_id):
            raise HTTPException(status_code=404, detail="Game not found")
        return self.games[game_id]

    def remove_player(self, game_id: str, player_id: str):
        """Remove a player from a game."""
        self.get_game(game_id).remove_player(player_id)
        return {"message": f"Player {player_id} removed from game {game_id}"}

    async def add_websocket_connection(self, game_id: str, player_id: str, websocket: WebSocket):
        """Add a WebSocket connection for a player."""
        await self.get_game(game_id).add_websocket_connection(player_id, websocket)

    async def remove_websocket_connection(self, game_id: str, player_id: str):
        """Remove a WebSocket connection for a player."""
        await self.get_game(game_id).remove_websocket_connection(player_id)

    async def handle_websocket_message(self, game_id: str, websocket: WebSocket, message: Message):
        """Handle WebSocket messages from a player."""
    
        game = self.get_game(game_id)

        # Identify the player ID from the WebSocket connection
        player_id = None
        for pid, conn in game.websockets.connections.items():
            if conn == websocket:
                player_id = pid
                break

        if not player_id:
            raise HTTPException(status_code=400, detail="Player not found for this WebSocket")

        await game.handle_websocket_message(player_id, message)
        
    async def handle_training_finished(self, game_id: str):
        game= self.get_game(game_id)
        await game.handle_training_ready()
        
        
    async def handle_training_error(self, game_id: str):
        game= self.get_game(game_id)
        await game.handle_training_error()
        
    async def handle_training_progress(self, game_id: str, progress: float):
        game= self.get_game(game_id)
        await game.handle_training_progress(progress)

