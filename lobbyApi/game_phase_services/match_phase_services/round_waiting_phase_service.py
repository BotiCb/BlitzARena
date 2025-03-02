from game.game_context import GameContext
from game_phase_services.match_phase_services.match_pase_abstract_service import MatchPhaseAbstractService
from game_phase_services.match_phase_services.match_context import MatchContext
from utils.area_validation import are_coordinates_within_distance
from models.player import Player
from utils.models import Coordinates, GameArea


class RoundWaitingService(MatchPhaseAbstractService):
    def __init__(self, context: MatchContext):
        super().__init__(context)

    def on_enter(self):
        pass
    
    def on_exit(self):
        pass
    
    def handle_player_position_change(self, player):
        base_coords = self.get_player_team_base_coordinates(player, self.context.game_area)
        player.set_ready(are_coordinates_within_distance(player.coordinates, base_coords, 5))        
        
        
    def get_player_team_base_coordinates(player: Player, game_area: GameArea) -> Coordinates:
        player_team = player.get_team()
        for team_base in game_area.team_bases:
            if team_base.team == player_team:
                return team_base.coordinates
        raise ValueError(f"No base found for team '{player_team}'")
        
    
    
    
    
    
    
    
    
    
    