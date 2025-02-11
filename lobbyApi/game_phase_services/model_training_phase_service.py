import os
from game.game_context import GameContext
from game_phase_services.phase_service import PhaseService

from models.message import Message
from ultralytics import YOLO


class ModelTrainingPhaseService(PhaseService):

    def __init__(self, context: GameContext):
        super().__init__(context)
        self.max_photos_per_player =30
        self.training_data_collected = []

    def on_enter(self):
        self.context.websockets.register_handler("training_photo_sent", self.on_training_data_received)

    def on_exit(self):
        self._unregister_handlers()

    async def on_training_data_received(self, player_id: str, message: dict):
        try:
            detected_player = message.get("detected_player")
            if detected_player in self.training_data_collected:
                await self.context.websockets.send_to_all(
                    Message({"type": "training_ready_for_player", "data": detected_player}))
                return
            player_photo_count = self.context.get_player(detected_player).increment_training_photo_count()

            print(f"Player {detected_player} has {player_photo_count} training photos")
            if player_photo_count >= self.max_photos_per_player:
                await self.context.websockets.send_to_all(
                    Message({"type": "training_ready_for_player", "data": detected_player}))
                self.training_data_collected.append(detected_player)
                print(
                    f"Training data collected for player {detected_player}, {len(self.training_data_collected)}/{len(self.context.players)} players collected")

        except KeyError as e:
            await self.context.websockets.send_error(player_id, f"Missing required key: {e}")
