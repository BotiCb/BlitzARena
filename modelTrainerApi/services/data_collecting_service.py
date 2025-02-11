import os
from fastapi import UploadFile
from pathlib import Path

DATASET_DIR = "dataset"

class DataCollectingService:
    def __init__(self):
        os.makedirs(DATASET_DIR, exist_ok=True)

    async def save_photo(self, game_id: str, player_id: str, file: UploadFile):
        # Define the paths
        game_folder = Path(DATASET_DIR) / game_id
        player_folder = game_folder / player_id
        train_folder = player_folder / "train"
        val_folder = player_folder / "val"

        # Create the directories if they don't exist
        train_folder.mkdir(parents=True, exist_ok=True)
        val_folder.mkdir(parents=True, exist_ok=True)

        # Count existing files to determine placement
        total_files = len(list(train_folder.glob("*.jpg"))) + len(list(val_folder.glob("*.jpg")))
        folder_to_use = val_folder if (total_files + 1) % 4 == 0 else train_folder

        # Define file path
        file_path = folder_to_use / file.filename

        # Save the file
        with open(file_path, "wb") as buffer:
            buffer.write(await file.read())

        return {"message": "File uploaded successfully", "path": str(file_path)}
