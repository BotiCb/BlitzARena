# model_training_service.py
import os
import asyncio
from concurrent.futures import ThreadPoolExecutor
from typing import Optional
from utils.dto_convention_converter import convert_dict_to_camel_case
from utils.csv_file_converter import read_training_csv
from utils.mappers import map_training_data
from ultralytics import YOLO
import torch
from services.firebase_file_storage_service import FirebaseStorageService
from services.httpx_service import HTTPXService
from ultralytics.utils.metrics import ConfusionMatrix

class ModelTrainingService:
    _active_trainings = 0
    _lock = threading.Lock()
    def __init__(self):
        self.dataset_dir = "dataset"
        self.executor = ThreadPoolExecutor(max_workers=4)
        self.httpx_service: HTTPXService = HTTPXService()
        self.firebase_file_storage_service: FirebaseStorageService = FirebaseStorageService()
        self._loop: Optional[asyncio.AbstractEventLoop] = None

    async def send_training_progress(self, progress: float, game_id: str):
        try:
            print(f"Training progress: {progress}")
            await self.httpx_service.get_api_client().post(
                f"/model-training/{game_id}/training-progress/{progress}"
            )
        except Exception as e:
            print(f"Error sending progress: {e}")

    async def train(self, game_id: str):
        try:
            with self._lock:
                ModelTrainingService._active_trainings += 1
            self._loop = asyncio.get_running_loop()
            await self.send_training_progress(0, game_id)
            
            model = YOLO("yolo11n-cls.pt")
            
            def on_train_epoch_end(trainer):
                progress = (trainer.epoch / trainer.args.epochs) * 75 +10
                asyncio.run_coroutine_threadsafe(
                    self.send_training_progress(progress, game_id),
                    self._loop
                )
            def on_train_end(trainer):
                asyncio.run_coroutine_threadsafe(
                    self.send_training_progress(85, game_id),
                    self._loop
    )

            model.add_callback("on_train_epoch_end", on_train_epoch_end)
            model.add_callback("on_train_end", on_train_end)

            print(f"Starting training for game: {game_id}")
            print(f"CUDA available: {torch.cuda.is_available()}")

            await self._loop.run_in_executor(
                self.executor,
                self._train_model_sync,
                model,
                game_id
            )

            await self.send_training_progress(95, game_id)
            print(f"Training completed for game: {game_id}")
            await self.httpx_service.get_api_client().post(
                f"/model-training/training-ended/{game_id}"
            )
            await self.send_training_progress(100, game_id)


        except Exception as e:
            print(f"Error during training for game {game_id}: {e}")
            await self.httpx_service.get_api_client().post(
                f"/model-training/training-error/{game_id}",
                json={"errorMessage": str(e)}
            )

        finally:
            with self._lock:
                ModelTrainingService._active_trainings -= 1

    def _train_model_sync(self, model, game_id: str):
        os.makedirs(f"models/{game_id}", exist_ok=True)
        try:
            # Initial sync progress update
            asyncio.run_coroutine_threadsafe(
                self.send_training_progress(5, game_id),
                self._loop
            ).result()

            # Main training
            results =model.train(
                data=f"{self.dataset_dir}/{game_id}",
                imgsz=320,
                rect=True,
                epochs=5,
                batch=200,
                workers=0,
                device=0,
                amp=True,
                half=True,
                project=f"models/{game_id}",
                plots=True
            )
            print(model.names)
            csv_dir = str(results.save_dir) + "\\results.csv"

            concurrent_count = ModelTrainingService._active_trainings - 1
            print(convert_dict_to_camel_case(map_training_data(results, read_training_csv(csv_dir), model, concurrent_trainings=concurrent_count)))
            asyncio.run_coroutine_threadsafe(
            self.httpx_service.get_api_client().post(
                f"/model-training/{game_id}/statistics",
                json=convert_dict_to_camel_case(map_training_data(results, read_training_csv(csv_dir), model))
            ),
            self._loop
        ).result()
            
            asyncio.run_coroutine_threadsafe(
                self.send_training_progress(90, game_id),
                self._loop
            ).result()

            # model.export(
            #     format="tflite",
            #     batch=1,
            #     imgsz=320,
            #     rect=True,
            #     project=f"models/{game_id}"
            # )

        except Exception as e:
            asyncio.run_coroutine_threadsafe(
                self.httpx_service.get_api_client().post(
                    f"/model-training/training-error/{game_id}",
                    json={"errorMessage": str(e)}
                ),
                self._loop
            ).result()
            raise