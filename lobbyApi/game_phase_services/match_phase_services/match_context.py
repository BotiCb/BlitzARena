class MatchContext:
    def __init__(self, 
                 game_context, 
                 transition_to_match_phase_callback,
                 get_round_number_callback
    ):
        self.game_context = game_context
        self.transition_to_match_phase = transition_to_match_phase_callback
        self.get_round_number = get_round_number_callback