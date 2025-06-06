# lobby_service.py
from game.game_context import GameContext
from game_phase_services.phase_abstract_service import PhaseAbstractService
from models.message import Message


class LobbyService(PhaseAbstractService):
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
        self.context.websockets.register_handler("start_next_phase", self.start_next_phase)
        self._registered_handlers.extend(["set_player_ready", "start_next_phase"])



    async def set_player_ready(self, player_id: str, message: dict):
        player = self.context.get_player(player_id)
        is_ready = message.get("is_ready", False)
        player.set_ready(is_ready)
        await self.context.websockets.send_to_all(
            Message({"type": "player_status", "data": {"is_ready": is_ready, "player_id": player_id}})
        )

    async def start_next_phase(self, player_id: str, message: dict):
        if self.context.is_host(player_id) and self.context.current_phase == "lobby":
            if self.context.is_all_players_ready():
                await self.context.transition_to_phase("training")
            else:
                await self.context.websockets.send_to_player(
                    player_id,
                    Message({"type": "error", "data": "Not all players are ready"})
                )
        else:
            await self.context.websockets.send_to_player(
                player_id,
                Message({"type": "error", "data": "Only the host can start the next phase"})
            )

    async def on_player_ready_to_phase(self, player_id: str) -> None:
        players_ready = [{"player_id": player.id, "is_ready": player.is_ready} for player in self.context.players]
        print (f"Players ready: {players_ready}")
        await self.context.websockets.send_to_player(
            player_id,
            Message({"type": "lobby_phase_info", "data": players_ready})
        )
