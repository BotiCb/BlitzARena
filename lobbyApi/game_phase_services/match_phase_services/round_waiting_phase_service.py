from game.game_context import GameContext
from game_phase_services.match_phase_services.match_pase_abstract_service import MatchPhaseAbstractService
from game_phase_services.match_phase_services.match_context import MatchContext
from utils.area_validation import are_coordinates_within_distance
from models.player import Player
from models.message import Message

from utils.models import Coordinates, GameArea


class RoundWaitingService(MatchPhaseAbstractService):
    def __init__(self, context: MatchContext):
        super().__init__(context)

    def on_enter(self):
        pass
    
    def on_exit(self):
        pass
    
    async def handle_player_position_change(self, player):
        base_coords = self.get_player_team_base_coordinates(player, self.context.game_context.game_area)
        is_player_in_base = are_coordinates_within_distance(player.coordinates, base_coords, 10)
        print (f"Player {player.id} is in base: {is_player_in_base}")
        player.set_ready(is_player_in_base)
        await self.context.game_context.websockets.send_to_all(Message(
            {
                "type": "player_status",
                "data": {
                    "is_ready": is_player_in_base, 
                    "player_id": player.id
                    }
            }
            ))
        if self.context.game_context.is_all_players_ready():
            print ("All players are ready. Starting the game...")
               
        
        
    def get_player_team_base_coordinates(self, player: Player, game_area: GameArea) -> Coordinates:
        player_team = player.get_team()
        for team_base in game_area.team_bases:
            if team_base.team == player_team:
                return team_base.coordinates
        raise ValueError(f"No base found for team '{player_team}'")
        
    
    
    
    
    
    
    
    
    
    