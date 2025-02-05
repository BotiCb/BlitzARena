# lobby_service.py
from game.game_context import GameContext
from game_phase_services.phase_service import PhaseService
from models.message import Message


class LobbyService(PhaseService):
    def __init__(self, context: GameContext):
        self.context = context
        self._registered_handlers = []

    def on_enter(self):
        """Register lobby-specific WebSocket handlers."""
        self._register_handlers()

    def on_exit(self):
        """Unregister handlers when leaving the lobby."""
        self._unregister_handlers()

    def _register_handlers(self):
        self.context.websockets.register_handler("set_player_ready", self.set_player_ready)
        self.context.websockets.register_handler("start_next_phase", self.start_next_phase)
        self._registered_handlers.extend(["set_player_ready", "start_next_phase"])

    def _unregister_handlers(self):
        for handler_type in self._registered_handlers:
            self.context.websockets.unregister_handler(handler_type)
        self._registered_handlers.clear()

    async def set_player_ready(self, player_id: str, message: dict):
        player = self.context.get_player(player_id)
        is_ready = message.get("is_ready", False)
        player.set_ready(is_ready)
        await self.context.websockets.send_to_all(
            Message({"type": "player_status", "data": {"is_ready": is_ready, "player_id": player_id}})
        )

    async def start_next_phase(self, player_id: str, message: dict):
        if self.context.is_host(player_id) and self.context.current_phase == "lobby":
            if all(player.is_ready for player in self.context.players):
                await self.context.transition_to_phase("training")
            else:
                await self.context.websockets.send_to_player(
                    player_id,
                    Message({"type": "all_players_status", "data": {"is_ready": False}})
                )
        else:
            await self.context.websockets.send_to_player(
                player_id,
                Message({"type": "not_host", "data": "Only the host can start the next phase"})
            )
