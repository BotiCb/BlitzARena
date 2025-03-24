# game_instance.py
from datetime import datetime
from typing import List, Dict
from fastapi import WebSocket, HTTPException

from dto.player.player_info_dto import PlayerInfoDto
from game.game_context import GameContext
from game_phase_services.lobby_phase_service import LobbyService
from game_phase_services.model_training_phase_service import ModelTrainingPhaseService
from game_phase_services.phase_abstract_service import PhaseAbstractService

from game_phase_services.game_room_phase_service import GameRoomService
from game_phase_services.match_phase_service import MatchService
from models.location import GameArea
from services.httpx_service import HTTPXService
from models.message import Message
from models.player import  Player


class GameInstance:
    def __init__(self, game_id: str, max_players: int = 4):
        self.max_players = max_players
        self.current_phase = "lobby"
        self.game_id = game_id
        self.is_model_trained = False
        self.httpx_service = HTTPXService()
        self.training_progress = 0

        # Initialize context and phase services
        self.context = GameContext(
            transition_to_phase_callback=self.transition_to_phase,
            get_current_phase=lambda: self.current_phase,
            get_game_id=lambda: self.game_id,
            is_model_trained=lambda: self.is_model_trained,
        )
        self.phase_services: Dict[str, PhaseAbstractService] = {
            "lobby": LobbyService(self.context),
            "training": ModelTrainingPhaseService(self.context),
            "game-room": GameRoomService(self.context),
            "match": MatchService(self.context)
        }
        self.current_phase_service = self.phase_services.get(self.current_phase)
        self._initialize_phase_service()

        # Register WebSocket handlers for general game actions
        self.context.websockets.register_handler("exit_from_game", self.exit_from_game)
        self.context.websockets.register_handler("set_host", self.new_host)
        self.context.websockets.register_handler("remove_player", self.remove_player)
        self.context.websockets.register_handler("ready_for_phase", self.on_player_ready_to_phase)
        self.context.websockets.register_handler("clock_sync", self.clock_sync)

    def _initialize_phase_service(self):
        """Initialize the current phase service."""
        if self.current_phase_service:
            self.current_phase_service.on_enter()

    async def transition_to_phase(self, phase: str):
        """Transition between game phases (e.g., lobby → training)."""
        if self.current_phase_service:
            self.current_phase_service.on_exit()

        self.current_phase = phase
        self.current_phase_service = self.phase_services.get(phase)

        if self.current_phase_service:
            self.set_all_players_unready()
            self.current_phase_service.on_enter()

        await self.context.websockets.send_to_all(
            Message({"type": "game_phase", "data": phase})
        )

    async def add_player(self, player_id: str):
        """Add a player to the game."""
        if self.is_player_in_game(player_id):
            raise HTTPException(status_code=400, detail="Player already in game")
        if len(self.context.players) >= self.max_players:
            raise HTTPException(status_code=403, detail="Game is full")
        if self.current_phase != "lobby":
            raise HTTPException(status_code=403, detail="Game is already in progress")

        is_host = len(self.context.players) == 0  # First player is the host
        new_player = Player(player_id, is_host=is_host)
        self.context.players.append(new_player)

        await self.context.websockets.send_to_all(
            Message({"type": "player_joined", "data": PlayerInfoDto(new_player)})
        )

    async def remove_player(self, player_id: str, message: dict):
        """Remove a player from the game."""
        if self.is_host(player_id):
            player_to_remove_id = message.get("player_id")
            player_to_remove = self.context.get_player(player_to_remove_id)
            if player_to_remove:
                await self.context.websockets.send_to_player(
                    player_to_remove_id,
                    Message({"type": "you_were_removed", "data": player_to_remove_id})
                )
                await self.remove_websocket_connection(player_to_remove_id)
                self.context.players.remove(player_to_remove)
                await self.context.websockets.send_to_all(
                    Message({"type": "player_removed", "data": player_to_remove_id})
                )
        else:
            await self.context.websockets.send_to_player(
                player_id,
                Message({"type": "not_host", "data": "Only the host can remove players"})
            )

    async def new_host(self, player_id: str, message: dict):
        """Set a new host for the game."""
        if self.is_host(player_id):
            new_host_id = message.get("player_id")
            new_host = self.context.get_player(new_host_id)
            if new_host:
                new_host.is_host = True
                self.context.get_player(player_id).is_host = False
                await self.context.websockets.send_to_all(
                    Message({"type": "new_host", "data": new_host_id})
                )

    async def exit_from_game(self, player_id: str, message: dict):
        """Handle a player exiting the game."""
        player_to_remove = self.context.get_player(player_id)
        if player_to_remove:
            await self.remove_websocket_connection(player_id)
            await self.context.websockets.send_to_all(
                Message({"type": "player_exited", "data": player_id})
            )
            self.update_player_connection_state(player_to_remove, "exited")
            self.context.players.remove(player_to_remove)

    def is_player_in_game(self, player_id: str) -> bool:
        """Check if a player is in the game."""
        return any(player.id == player_id for player in self.context.players)

    def is_host(self, player_id: str) -> bool:
        """Check if a player is the host."""
        return self.context.get_player(player_id).is_host

    async def add_websocket_connection(self, player_id: str, websocket: WebSocket):
        """Add a WebSocket connection for a player."""
        player = self.context.get_player(player_id)
        if player.is_connected:
            raise HTTPException(status_code=400, detail="Player already connected")

        await self.context.websockets.add_connection(player_id, websocket)
        player.is_connected = True

        await self.context.websockets.send_to_player(
            player_id,
            Message({"type": "game_info", "data": self.get_game_info()})
        )
        await self.context.websockets.send_to_all_except(
            player_id,
            Message({"type": "player_connected", "data": player_id})
        )
        await self.update_player_connection_state(player, "connected")
        
    async def remove_websocket_connection(self, player_id: str):
        """Remove a WebSocket connection for a player."""
        await self.context.websockets.remove_connection(player_id)
        player = self.context.get_player(player_id)
        player.is_connected = False

        if player.is_host:
            player.set_host(False)
            await self.set_new_host()

        await self.context.websockets.send_to_all(
            Message({"type": "player_disconnected", "data": player_id})
        )
        await self.update_player_connection_state(player, "disconnected")

    async def set_new_host(self):
        """Set a new host when the current host leaves."""
        connected_players = [p for p in self.context.players if p.is_connected]
        if connected_players:
            new_host = min(connected_players, key=lambda p: p.added_at)
            new_host.is_host = True
            await self.context.websockets.send_to_all(
                Message({"type": "new_host", "data": new_host.id})
            )

    def get_game_info(self) -> dict:
        """Get the current game state."""
        return {
            "game_id": self.game_id,
            "players": [PlayerInfoDto(player) for player in self.context.players],
            "current_phase": self.current_phase,
            "max_players": self.max_players,
            "is_model_trained": self.is_model_trained,
            "training_progress": self.training_progress
        }

    async def handle_websocket_message(self, player_id: str, message: Message):
        """Delegate WebSocket message handling to the WebSocketService."""
        await self.context.websockets.handle_message(player_id, message)

    def set_all_players_unready(self):
        for player in self.context.players:
            player.set_ready(False)
            
            
    async def handle_training_ready(self):
        self.is_model_trained = True
        await self.context.websockets.send_to_all(
            Message({"type": "model_ready", "data": {}})
        )
        
    async def handle_training_error(self):
        await self.context.websockets.send_to_all(
            Message({"type": "training_error", "data": {}})
        )
        await self.transition_to_phase("training")
        
        
    async def handle_training_progress(self, progress):
        self.training_progress= progress
        await self.context.websockets.send_to_all(
            Message({"type": "training_progress", "data": {
                "progress": progress
            }})
        )
        
    def has_connected_players(self) -> bool:
        return any(player.is_connected for player in self.context.players)
    
    async def update_player_connection_state(self, player, status):
        res =await self.httpx_service.get_api_client().post(f"game/{self.game_id}/player/{player.id}/connection-status/{status}")
        print( f"Player {player.id} connection status updated to {status}")


    async def on_player_ready_to_phase(self, player_id: str, message: dict):
        await self.current_phase_service.on_player_ready_to_phase(player_id)
        
    async def clock_sync(self, player_id: str, message: dict):
        client_sent = message.get("client_sent")
        server_received = int(datetime.now().timestamp() * 1000)
        await self.context.websockets.send_to_player(
            player_id,
            Message({"type": "clock_sync", "data": {"client_sent": client_sent, "server_received": server_received}})
        )
        
