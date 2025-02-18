# lobby_service.py
from game.game_context import GameContext
from game_phase_services.phase_service import PhaseService
from models.message import Message


class GameRoomService(PhaseService):
    def __init__(self, context: GameContext):
        super().__init__(context)

    def on_enter(self):
        """Register lobby-specific WebSocket handlers."""
        self._register_handlers()

    def on_exit(self):
        """Unregister handlers when leaving the lobby."""
        self._unregister_handlers()

    def _register_handlers(self):
        self.context.websockets.register_handler("set_player_ready", self.set_player_ready)
        self.context.websockets.register_handler("start_next_phase", self.start_match)
        self._registered_handlers.extend(["set_player_ready", "start_next_phase"])



    async def set_player_ready(self, player_id: str, message: dict):
        player = self.context.get_player(player_id)
        if  not self.context.is_model_trained():
            await self.context.websockets.send_to_player(
                player_id,
                Message({"type": "error", "data": "Model is not trained yet"})
            )
            return
        is_ready = message.get("is_ready", False)
        player.set_ready(is_ready)
        await self.context.websockets.send_to_all(
            Message({"type": "player_status", "data": {"is_ready": is_ready, "player_id": player_id}})
        )

    async def start_match(self, player_id: str, message: dict):
        if self.context.is_host(player_id) :
            if self.context.is_all_players_ready():
                if self.context.is_model_trained():
                    await self.context.transition_to_phase("match")
                else:
                    await self.context.websockets.send_to_player(
                        Message({"type": "error", "data": "Model is not trained yet"})
                    )
            else:
                await self.context.websockets.send_to_player(
                    player_id,
                    Message({"type": "error", "data": "Not all players are ready"})
                )
        else:
            await self.context.websockets.send_to_player(
                player_id,
                Message({"type": "error", "data": "Only the host can start the game"})
            )
