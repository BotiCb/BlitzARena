import base64
import os
from io import BytesIO
from game.game_context import GameContext
from game_phase_services.phase_service import PhaseService
from PIL import Image

from models.message import Message


class ModelTrainingPhaseService(PhaseService):

    def __init__(self, context: GameContext):
        super().__init__(context)
        self.max_photos_per_player = 10
        self.validation_photos_percentage = 0.25
        self.photo_size = 320
        self.dataset_path = "dataset"

    def on_enter(self):
        self.context.websockets.register_handler("training_data", self.on_training_data_received)

    def on_exit(self):
        self._unregister_handlers()

    async def on_training_data_received(self, player_id: str, message: dict):
        try:
            detected_player = message.get("detected_player")
            photo_base_64 = message.get("photo")
            player_photo_count = self.context.get_player(detected_player).get_training_photo_count()
            print(f"Player {detected_player} has {player_photo_count} training photos")
            if  player_photo_count < self.max_photos_per_player:
                image_bytes = base64.b64decode(photo_base_64)
                image = Image.open(BytesIO(image_bytes))
                width, height = image.size
                if width > height:
                    image = image.rotate(270, expand=True)
                    width, height = height, width
                    image = image.resize((self.photo_size, self.photo_size))
                file_name = f"{detected_player}_{player_photo_count}.jpg"
                split = "val" if player_photo_count % (
                            1 / self.validation_photos_percentage) == 0 else "train"
                img_path = os.path.join(self.dataset_path, self.context.get_game_id(), detected_player,split)
                os.makedirs(img_path, exist_ok=True)
                image.save(os.path.join(img_path, file_name))
                self.context.get_player(detected_player).increment_training_photo_count()
            else:
                await self.context.websockets.send_to_player(player_id, Message({"type": "training_ready_for_player"}))
        except Exception as e:
            print(f"Error processing training data: {e}")
        except KeyError as e:
            await self.context.websockets.send_error(player_id, f"Missing required key: {e}")
