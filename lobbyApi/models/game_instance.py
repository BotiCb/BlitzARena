from typing import List, Dict
from fastapi import WebSocket, HTTPException

from models.player import Player
from services.websocket_service import WebSocketService


class GameInstance:
    def __init__(self, game_id: str):
        self.game_id = game_id
        self.players: List[Player] = []
        self.websockets = WebSocketService()


    def add_player(self, player_id: str):
        if self.is_player_in_game(player_id):
            raise HTTPException(status_code=400, detail="Player already in game")
        self.players.append(Player(player_id))

    def remove_player(self, player_id: str):
        if not self.is_player_in_game(player_id):
            raise HTTPException(status_code=400, detail="Player not in game")
        self.players = [player for player in self.players if player.player_id != player_id]

    def is_player_in_game(self, player_id: str) -> bool:
        return any(player.player_id == player_id for player in self.players)

    async def add_websocket_connection(self, player_id: str, websocket: WebSocket):
        if not self.is_player_in_game(player_id):
            raise HTTPException(status_code=400, detail="Player not in game")
        if player_id in self.websockets.connections:
            raise HTTPException(status_code=400, detail="Player already connected")
        await self.websockets.add_connection(player_id, websocket)
        await self.websockets.send_to_all({"message": f"Player {player_id} connected to game {self.game_id}"})


    async def remove_websocket_connection(self, player_id: str):
        await self.websockets.remove_connection(player_id)
        await self.websockets.send_to_all({"message": f"Player {player_id} disconnected from game {self.game_id}"})

    async def handle_websocket_message(self, player_id: str, message: dict):
        """Delegate message handling to WebSocketService."""
        await self.websockets.handle_message(player_id, message)

    async def get_game_info(self):
        return {"game_id": self.game_id, "players": [player.player_id for player in self.players]}
