from abc import ABC, abstractmethod
from game.game_context import GameContext
from game_phase_services.match_phase_services.match_context import MatchContext
from models.player import Player
from utils.models import Coordinates


class MatchPhaseAbstractService(ABC):
    def __init__(self, context: MatchContext):
        self.context = context
        self._registered_handlers = []
        
    @abstractmethod
    def on_enter(self):
        pass
    
    @abstractmethod
    def on_exit(self):
        pass
    
    def _unregister_handlers(self):
        for handler_type in self._registered_handlers:
            self.context.game_context.gwebsockets.unregister_handler(handler_type)
        self._registered_handlers.clear()
        
        
        
    async def on_player_position(self, player_id: str, message: dict):
        try: 
                longitude = message.get("longitude")
                latitude = message.get("latitude")
                
                if longitude is None or latitude is None:
                    raise ValueError("Longitude and latitude must be provided.")
                player  = self.context.game_context.get_player(player_id)
                player.set_coordinates(Coordinates(longitude, latitude))
                await self.handle_player_position_change(player, message)
        except (KeyError, ValueError) as e:
            await self.context.game_context.websockets.send_error(player_id, f"Error: {e}")
            
    @abstractmethod
    async def handle_player_position_change(self, player: Player):
        pass