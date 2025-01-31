from typing import List, Dict
from fastapi import WebSocket, HTTPException

from dto.player.player_info_dto import PlayerInfoDto
from models.message import Message
from models.player import Player
from services.lobby_service import LobbyService
from services.websocket_service import WebSocketService


class GameInstance:
    def __init__(self, game_id: str, max_players: int = 4):
        self.game_id = game_id
        self.max_players = max_players
        self.players: List[Player] = []
        self.websockets = WebSocketService()
        self.current_phase = "lobby"
        # Initialize services
        self.lobby_service = LobbyService(self)
        self.websockets.register_handler("remove_player", self.remove_player)
        self.websockets.register_handler("new_host", self.new_host)
        self.websockets.register_handler("exit_from_game", self.exit_from_game)

    def add_player(self, player_id: str):
        if self.is_player_in_game(player_id):
            raise HTTPException(status_code=400, detail="Player already in game")
        if len(self.players) >= self.max_players:
            raise HTTPException(status_code=403, detail="Game is full")
        if self.current_phase != "lobby":
            raise HTTPException(status_code=403, detail="Game is already in progress")
        is_host = len(self.players) == 0
        new_player = Player(player_id, is_host=is_host)
        self.players.append(new_player)

    async def remove_player(self, player_id: str, message: dict):

        if self.is_host(player_id):
            player_to_remove = self.get_player(message.get("player_id", 0))
            if player_to_remove:
                await self.websockets.send_to_player(player_to_remove.id,
                                                     Message({"type": "you_were_removed", "data": player_to_remove.id}))
                await self.remove_websocket_connection(player_to_remove.id)
                self.players.remove(player_to_remove)
                await self.websockets.send_to_all(Message({"type": "player_removed", "data": player_to_remove.id}))
        else:
            await self.websockets.send_to_player(player_id, Message({
                "type": "not_host",
                "data": "Only the host can remove players"
            }))

    async def new_host(self, player_id: str, message: dict):
        if self.is_host(player_id):
            player_to_promote = self.get_player(message.get("player_id", 0))
            if player_to_promote:
                player_to_promote.is_host = True
                self.get_player(player_id).is_host = False
                await self.websockets.send_to_player(player_to_promote.id, Message({"type": "host_role_received", "data": player_to_promote.id}))
                await self.websockets.send_to_all_except(player_to_promote.id,Message({"type": "new_host", "data": player_to_promote.id}))

    async def exit_from_game(self, player_id: str, message: dict):
        player_to_remove = self.get_player(player_id)
        if player_to_remove:
            await self.remove_websocket_connection(player_id)
            await self.websockets.send_to_all(Message({"type": "player_exited", "data": player_id}))
            self.players.remove(player_to_remove)

    def is_player_in_game(self, player_id: str) -> bool:
        return any(player.id == player_id for player in self.players)

    def is_all_players_ready(self) -> bool:
        return all(player.ready for player in self.players)

    async def add_websocket_connection(self, player_id: str, websocket: WebSocket):
        if not self.is_player_in_game(player_id):
            raise HTTPException(status_code=400, detail="Player not in game")
        if player_id in self.websockets.connections:
            raise HTTPException(status_code=400, detail="Player already connected")
        await self.websockets.add_connection(player_id, websocket)
        self.get_player(player_id).is_connected = True
        await self.websockets.send_to_player(player_id, Message({
            "type": "game_info",
            "data": self.get_game_info()
        }))
        await self.websockets.send_to_all_except(player_id, Message({
            "type": "player_connected",
            "data": player_id
        }))

    async def remove_websocket_connection(self, player_id: str):
        await self.websockets.remove_connection(player_id)
        player = self.get_player(player_id)
        player.is_connected = False
        if self.is_host(player_id):
            await self.set_new_host()
        player.is_host = False

        await self.websockets.send_to_all(Message({
            "type": "player_disconnected",
            "data": player_id
        }))

    async def handle_websocket_message(self, player_id: str, message: Message):
        """Delegate message handling to WebSocketService."""
        await self.websockets.handle_message(player_id, message)

    def get_game_info(self):
        return {
            "game_id": self.game_id,
            "players": [PlayerInfoDto(player) for player in self.players],
            "current_phase": self.current_phase,
            "max_players": self.max_players
        }

    def get_player(self, player_id: str) -> Player:
        """Get a player by their ID."""
        for player in self.players:
            if player.id == player_id:
                return player
        raise HTTPException(status_code=404, detail="Player not found")

    def is_host(self, player_id: str) -> bool:
        return self.get_player(player_id).is_host

    def get_earliest_connected_player(self) -> Player | None:
        connected_players = [p for p in self.players if p.is_connected]
        return min(connected_players, key=lambda p: p.added_at, default=None)

    async def set_new_host(self):
        new_host = self.get_earliest_connected_player()
        new_host.set_host(True)
        await self.websockets.send_to_all(
            Message({"type": "new_host", "data": new_host.id})
        )
