from game.game_context import GameContext
from game_phase_services.phase_service import PhaseService


class ModelTrainingPhaseService(PhaseService):

    def __init__(self, context: GameContext):
        super().__init__(context)

    def on_enter(self):
        self.context.websockets.register_handler("training_data", self.on_training_data_recieved)

    def on_exit(self):
        self._unregister_handlers()

    async def on_training_data_recieved(self, player_id: str, message: dict):
        print(message)
