from game_phase_services.phase_service import PhaseService
from game.game_context import GameContext
from lobbyApi.utils.models import Coordinates


class MatchService(PhaseService):
    
    def __init__(self, context: GameContext):
        super().__init__(context)
        self.current_round = 0
        self.max_rounds = 10
        self.round_phases = {
            "waiting": RoundWaitingService(context),
            "battle": RoundBattleService(context)
        }
        self.current_phase_service = None
        
    def on_enter(self):
        """Register lobby-specific WebSocket handlers."""
        self._register_handlers()

    def on_exit(self):
        """Unregister handlers when leaving the lobby."""
        self._unregister_handlers()

    def _register_handlers(self):
        self.context.websockets.register_handler("player_location", self.on_player_position)
        
    async def on_player_position(self, player_id: str, message: dict):
        try:
                if self.context.game_area:
                    return  
                longitude = message.get("longitude")
                latitude = message.get("latitude")
                
                if longitude is None or latitude is None:
                    raise ValueError("Longitude and latitude must be provided.")
                
                self.context.get_player(player_id).set_coordinates(Coordinates(longitude, latitude))
        except (KeyError, ValueError) as e:
            await self.context.websockets.send_error(player_id, f"Error: {e}")



    