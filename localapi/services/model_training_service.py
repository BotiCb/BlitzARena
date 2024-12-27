import base64
import json
import os

from services.websocket.websocket_service import WebSocketService


class ModelTrainingService:
    def __init__(self):
        # Initialize file_count as a class instance variable
        self.file_count = 0
        self.websocket_service = WebSocketService()
        self.websocket_service.register_message_handler("training_data", self.handle_recived_training_image)

    async def handle_recived_training_image(self, client_id, websocket, message):
        try:
            # Increment the file count to ensure unique filenames
            self.file_count += 1

            # Determine if this file should go to train or val
            is_validation = self.file_count % 7 == 0
            split = "val" if is_validation else "train"

            # Parse the `data` field, which is a JSON string
            data = json.loads(message.get("data", "{}"))

            # Extract the base64-encoded photo
            photo_data = data.get("photo")
            if not photo_data:
                print("No photo data found in the message.")
                return

            # Decode the base64 photo data
            image_bytes = base64.b64decode(photo_data)

            # Extract the detected player number
            detected_player = data.get("detectedPlayer", "")
            if not detected_player:
                print("No detected player found in the message.")
                return

            # Ensure detectedPlayer is a string for consistent directory naming
            detected_player = str(detected_player)

            # Create the player-specific directory under `train` or `val`
            dataset_dir = "dataset"
            player_dir = os.path.join(dataset_dir, split, detected_player)
            os.makedirs(player_dir, exist_ok=True)

            # Generate a unique file name using the file count
            filename = f"image_{self.file_count:04d}"

            # Save the image in the player-specific folder
            image_filename = os.path.join(player_dir, f"{filename}.jpg")
            with open(image_filename, "wb") as image_file:
                image_file.write(image_bytes)

            print(f"Image saved successfully as {image_filename}")



        except json.JSONDecodeError as e:
            print(f"Error decoding JSON data: {e}")
        except base64.binascii.Error as e:
            print(f"Error decoding base64 image: {e}")
        except Exception as e:
            print(f"Error handling training image: {e}")
