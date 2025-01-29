from typing import Dict, Optional
from models.player import Player
from services.websocket_service import WebSocketService


class LobbyService:
    def __init__(self, game_instance):
        self.game_instance = game_instance  # Link to the current GameInstance
        self.websocket_service = game_instance.websockets  # Shared WebSocketService
        self.websocket_service.register_handler("set_player_ready", self.set_player_ready)
        self.websocket_service.register_handler("start_next_phase", self.start_next_phase)

    async def set_player_ready(self, player_id: str, message: dict):
        """Set a player's status to 'ready'."""
        player = self.game_instance.get_player(player_id)
        is_ready = message.get("is_ready", False)
        player.set_ready(is_ready)
        if not is_ready:
            await self.websocket_service.send_to_player(player_id, {"message": "You are not ready"})
            await self.websocket_service.send_to_all_except(player_id, {"message": f"{player.id} is not ready"})
            return

        await self.websocket_service.send_to_player(player_id, {"message": "You are ready"})
        await self.websocket_service.send_to_all_except(player_id, {"message": f"{player.id} is ready"})


        # Check if all players are ready



    async def start_next_phase(self, player_id: str, message: dict):
        if self.game_instance.is_host(player_id) and self.game_instance.current_phase == "lobby":
            if self.game_instance.is_all_players_ready():
             await self.transition_to_training()
            else:
                await self.websocket_service.send_to_player(player_id, {"message": "Not all players are ready"})
        else:
            await self.websocket_service.send_to_player(player_id, {"message": "Only the host can start the next phase"})


    async def transition_to_training(self):
        """Transition the game from lobby to training phase."""
        self.game_instance.transition_to_phase("training")
        await self.websocket_service.send_to_all({"message": "All players are ready. Starting training phase!"})
