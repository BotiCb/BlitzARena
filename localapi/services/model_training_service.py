import base64
import json
import os
from PIL import Image, ImageOps
from io import BytesIO
from services.websocket.websocket_service import WebSocketService
from ultralytics import YOLO


class ModelTrainingService:
    def __init__(self, max_photos_per_player=125):
        # Initialize file_count as a class instance variable
        self.file_count = 0
        self.isTraining = False
        self.websocket_service = WebSocketService()
        self.websocket_service.register_message_handler("training_data", self.handle_received_training_image)
        self.websocket_service.register_message_handler("training_start", self.handle_received_training_start)

        # Initialize a dictionary to track the photo count per player
        self.player_photo_count = {}
        self.max_photos_per_player = max_photos_per_player

    async def handle_received_training_image(self, client_id, websocket, message):
        try:
            # Parse the `data` field, which is a JSON string
            data = json.loads(message.get("data", "{}"))

            # Extract the base64-encoded photo
            photo_data = data.get("photo")
            if not photo_data:
                print("No photo data found in the message.")
                return

            # Extract the detected player number
            detected_player = data.get("detectedPlayer", "")
            if not detected_player:
                print("No detected player found in the message.")
                return

            # Ensure detectedPlayer is a string for consistent directory naming
            detected_player = str(detected_player)

            # Check if the player has reached the maximum photo count
            if self.player_photo_count.get(detected_player, 0) >= self.max_photos_per_player:
                print(f"Player {detected_player} has reached the maximum photo count. Image not saved.")
                self.websocket_service.broadcast(json.dumps({"type": "training_ready_for_player", "data": {
                    "detectedPlayer": detected_player
                }}))
                return

            # Increment the player's photo count
            self.player_photo_count[detected_player] = self.player_photo_count.get(detected_player, 0) + 1

            # Increment the file count to ensure unique filenames
            self.file_count += 1

            # Determine if this file should go to train, val, or test
            is_validation = self.file_count % 4 == 0

            if is_validation:
                split = "val"
            else:
                split = "train"

            # Decode the base64 photo data
            image_bytes = base64.b64decode(photo_data)

            # Create the player-specific directory under `train`, `val`, or `test`
            dataset_dir = "dataset"
            player_dir = os.path.join(dataset_dir, split, detected_player)
            os.makedirs(player_dir, exist_ok=True)

            # Generate a unique file name using the file count
            filename = f"image_{self.file_count:04d}"

            # Open the image
            image = Image.open(BytesIO(image_bytes))
            width, height = image.size

            # Check if the image is in landscape orientation and rotate if necessary
            if width > height:
                image = image.rotate(270, expand=True)
                width, height = height, width

            # Resize the image while keeping its height constant
            target_height = 480  # Desired height of the final image
            aspect_ratio = width / height
            target_width = int(target_height * aspect_ratio)
            resized_image = image.resize((target_width, target_height), Image.Resampling.BICUBIC)

            # Calculate the padding to make the image square
            padding_left = (480 - target_width) // 2
            padding_right = 480 - target_width - padding_left

            # Add padding to the sides to make the image square
            padded_image = ImageOps.expand(resized_image, border=(padding_left, 0, padding_right, 0), fill=(0, 0, 0))

            # Save the padded image in the player-specific folder
            image_filename = os.path.join(player_dir, f"{filename}.jpg")
            padded_image.save(image_filename, "JPEG")

            print(f"Image saved successfully as {image_filename}")

        except json.JSONDecodeError as e:
            print(f"Error decoding JSON data: {e}")
        except base64.binascii.Error as e:
            print(f"Error decoding base64 image: {e}")
        except Exception as e:
            print(f"Error handling training image: {e}")



    async def handle_received_training_start(self, client_id, websocket, message):

        if self.isTraining:
            print("Training is already in progress. Please wait for the current training to finish before starting a new one.")
            return

        self.isTraining = True
        #check if the dataset dir exist:
        if not os.path.exists("dataset"):
            print("Dataset directory does not exist.")
            return
        model = YOLO("yolo11n-cls.pt")

        model.train(data="./dataset",
                    imgsz=320, rect=True, epochs=10, batch=150, patience=3, workers=0, device=0, amp=True)

        model.export(format="tflite", batch=1, imgsz=[320, 192], rect=True, device=0)
