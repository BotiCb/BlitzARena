class MatchContext:
    def __init__(self, 
                 game_context, 
                 transition_to_match_phase_callback,
                 get_round_number_callback,
                 increment_round_callback
    ):
        self.game_context = game_context
        self.transition_to_match_phase = transition_to_match_phase_callback
        self.get_round_number = get_round_number_callback
        self.increment_round = increment_round_callback
        
        
        
    def reset_health_points_for_all_players(self):
        for player in self.game_context.players:
            player.revive()
            
    def is_all_players_eliminated(self):
        return all(player.health_points == 0 for player in self.game_context.players)