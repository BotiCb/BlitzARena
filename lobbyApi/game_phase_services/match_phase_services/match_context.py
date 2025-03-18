from typing import List

from models.player import Player


class MatchContext:
    def __init__(self, 
                 game_context, 
                 transition_to_match_phase_callback,
                 get_round_number_callback,
                 increment_round_callback,
                 increment_score_callback
    ):
        self.game_context = game_context
        self.transition_to_match_phase = transition_to_match_phase_callback
        self.get_round_number = get_round_number_callback
        self.increment_round = increment_round_callback
        self.increment_score = increment_score_callback
        
        
        
    def reset_health_points_for_all_players(self):
        for player in self.game_context.players:
            player.revive()
            
    def get_team_with_no_players_left(self):
        for team in self.game_context.get_teams():
            if len(self.get_alive_players_from_team(team)) == 0:
                return team
        return None
    
    def get_alive_players_from_team(self, team: str) -> List[Player]:
        """Get alive players from the given team."""
        return [player for player in self.game_context.get_players_in_team(team) if player.is_alive()]
