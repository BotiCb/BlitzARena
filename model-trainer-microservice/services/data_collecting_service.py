# data_collecting_service.py
import os
from pathlib import Path
import aiofiles
from fastapi import UploadFile

DATASET_DIR = "dataset"

class DataCollectingService:
    def __init__(self):
        os.makedirs(DATASET_DIR, exist_ok=True)

    async def save_photo(self, game_id: str, player_id: str, file: UploadFile):
        try:
            # Define the game-level train and val folders
            game_folder = Path(DATASET_DIR) / game_id
            train_folder = game_folder / "train" / player_id
            val_folder = game_folder / "val" / player_id

            # Create player directories inside train and val
            train_folder.mkdir(parents=True, exist_ok=True)
            val_folder.mkdir(parents=True, exist_ok=True)

            # Count total files to decide placement
            total_files = len(list(train_folder.glob("*.jpg"))) + len(list(val_folder.glob("*.jpg")))
            folder_to_use = val_folder if (total_files + 1) % 4 == 0 else train_folder

            # Define file path
            file_path = folder_to_use / file.filename

            # Read file content and write it asynchronously
            content = await file.read()
            async with aiofiles.open(file_path, "wb") as buffer:
                await buffer.write(content)

            return {"message": "File uploaded successfully", "path": str(file_path)}
        except Exception as e:
            print(f"Error saving photo: {e}")
            raise e
