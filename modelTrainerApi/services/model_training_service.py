# model_training_service.py
from ultralytics import YOLO
import torch
import asyncio
from concurrent.futures import ThreadPoolExecutor

class ModelTrainingService:
    def __init__(self):
        self.dataset_dir = "dataset"
        self.executor = ThreadPoolExecutor(max_workers=4)  # Adjust based on your system

    async def train(self, game_id: str):
        try:
            print(f"Starting training for game: {game_id}")
            print(f"CUDA available: {torch.cuda.is_available()}")

            model = YOLO("yolo11n-cls.pt")
            loop = asyncio.get_running_loop()

            # Offload training to the executor
            await loop.run_in_executor(
                self.executor,
                self._train_model,
                model,
                game_id
            )

            print(f"Training completed for game: {game_id}")
            return {"status": "success", "message": f"Training process completed for game: {game_id}"}
        except Exception as e:
            print(f"Error during training for game {game_id}: {e}")
            return {"status": "error", "message": f"Training failed for game: {game_id}"}

    def _train_model(self, model, game_id: str):
        model.train(
            data=f"{self.dataset_dir}/{game_id}",
            imgsz=320, rect=True, epochs=20, batch=200, workers=0, device=0, amp=True, half=True
        )
        model.export(format="tflite", batch=1, imgsz=320, rect=True)
