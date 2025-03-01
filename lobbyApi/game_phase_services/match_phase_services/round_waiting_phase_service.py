from game.game_context import GameContext
from game_phase_services.phase_service import PhaseService


class RoundWaitingService(PhaseService):
    def __init__(self, context: GameContext):
        super().__init__(context)

    def on_enter(self):
        pass
    
    def on_exit(self):
        pass