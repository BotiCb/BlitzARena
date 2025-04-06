import os
import asyncio
import httpx
import json
from concurrent.futures import ThreadPoolExecutor
import threading
from typing import Optional
from datetime import timedelta
from utils.dto_convention_converter import convert_dict_to_camel_case
from utils.csv_file_converter import read_training_csv
from utils.mappers import map_training_data
from services.httpx_service import HTTPXService
from utils.jwt_handler import create_jwt
from ultralytics import YOLO
import torch

class TrainingAbortedError(Exception):
    def __init__(self, message, server_message):
        super().__init__(message)
        self.server_message = server_message

class ModelTrainingService:
    _active_trainings = 0
    _lock = threading.Lock()
    _aborted_game_ids = set()

    def __init__(self):
        self.dataset_dir = "dataset"
        self.executor = ThreadPoolExecutor(max_workers=4)
        self.httpx_service = HTTPXService()
        self._loop: Optional[asyncio.AbstractEventLoop] = None

    async def send_training_progress(self, progress: float, game_id: str):
        try:
            print(f"Training progress: {progress}")
            response = await self.httpx_service.get_api_client().post(
                f"game/{game_id}/model-training/training-progress/{progress}"
            )
            response.raise_for_status()
        except httpx.HTTPStatusError as e:
            if e.response.status_code == 400:
                try:
                    error_data = e.response.json()
                    server_msg = error_data.get('message', 'Unknown server error')
                except json.JSONDecodeError:
                    server_msg = e.response.text or 'Invalid server response'
                
                raise TrainingAbortedError(
                    f"Server rejected progress update with 400 error: {server_msg}",
                    server_message=server_msg
                )
            raise
        except Exception as e:
            print(f"Error sending progress: {e}")
            raise

    async def train(self, game_id: str, image_size: int):
        try:
            with self._lock:
                ModelTrainingService._active_trainings += 1
                self._aborted_game_ids.discard(game_id)

            self._loop = asyncio.get_running_loop()
            await self.send_training_progress(0, game_id)

            model = YOLO("yolo11n-cls.pt")
            await self.send_training_progress(5, game_id)
            abort_event = threading.Event()

            def on_train_batch_end(trainer):
                if abort_event.is_set():
                    trainer.should_stop = True
                    raise TrainingAbortedError("Training aborted", "Training stopped by server request")

            def on_train_epoch_end(trainer):
                progress = (trainer.epoch / trainer.args.epochs) * 75 + 10
                future = asyncio.run_coroutine_threadsafe(
                    self.send_training_progress(progress, game_id),
                    self._loop
                )
                
                try:
                    future.result()
                except TrainingAbortedError as e:
                    abort_event.set()
                    trainer.should_stop = True
                    # Store server message in exception
                    raise TrainingAbortedError(str(e), e.server_message)
                except Exception as e:
                    print(f"Error handling progress update: {e}")

            model.add_callback("on_train_epoch_end", on_train_epoch_end)
            model.add_callback("on_train_batch_end", on_train_batch_end)

            try:
                model_path = await self._loop.run_in_executor(
                    self.executor,
                    self._train_model_sync,
                    model, game_id, image_size, abort_event
                )
            except TrainingAbortedError as e:
                await self.handle_training_abortion(game_id, e.server_message)
                return

            await self.send_training_progress(95, game_id)
            await self.upload_model(model_path, game_id)
            await self.send_training_progress(100, game_id)
            await self.httpx_service.get_api_client().post(
                f"game/{game_id}/model-training/training-ended"
            )

        except TrainingAbortedError as e:
            await self.handle_training_abortion(game_id, e.server_message)
        except Exception as e:
            await self.handle_training_error(game_id, str(e))
        finally:
            with self._lock:
                ModelTrainingService._active_trainings -= 1
                self._aborted_game_ids.discard(game_id)

    async def handle_training_abortion(self, game_id: str, error_msg: str):
        print(f"Training aborted for {game_id}: {error_msg}")
        await self.httpx_service.get_api_client().post(
            f"game/{game_id}/model-training/training-error",
            json={"errorMessage": error_msg}
        )

    async def handle_training_error(self, game_id: str, error_msg: str):
        print(f"Training error for {game_id}: {error_msg}")
        await self.httpx_service.get_api_client().post(
            f"game/{game_id}/model-training/training-error",
            json={"errorMessage": error_msg}
        )

    async def upload_model(self, model_path: str, game_id: str):
        with open(model_path, "rb") as model_file:
            files = {"file": (os.path.basename(model_path), model_file)}
            response = await self.httpx_service.get_api_client().post(
                f"game/{game_id}/model-training/upload-tflite-model",
                files=files,
                timeout=30.0
            )
            response.raise_for_status()
            
    def get_optimal_batch_size(self, image_size, target_memory_fraction=0.5, max_total_fraction=0.5):
        """
        Determines the optimal batch size based on available free GPU memory,
        considering both current allocations and system reserves.
        """
        if not torch.cuda.is_available():
            return 32  # Default batch size for CPU

        device = torch.cuda.current_device()
        
        # Clear GPU cache for accurate memory measurement
        torch.cuda.empty_cache()
        
        # Get memory statistics
        total_memory = torch.cuda.get_device_properties(device).total_memory
        allocated_memory = torch.cuda.memory_allocated(device)
        free_memory = total_memory - allocated_memory

        # Calculate safe memory limits
        max_target_memory = int(total_memory * max_total_fraction)
        desired_target_memory = int(free_memory * target_memory_fraction)
        target_memory = min(desired_target_memory, max_target_memory)

        print(f"Memory Status: {allocated_memory/(1024**3):.2f}GB used, "
            f"{free_memory/(1024**3):.2f}GB free, "
            f"Target: {target_memory/(1024**3):.2f}GB")

        # Calculate memory requirements with safety buffer
        bytes_per_pixel = 4  # float32
        channels = 3
        memory_multiplier = 8  # Adjusted based on YOLO architecture requirements
        
        memory_per_image = (image_size ** 2) * channels * bytes_per_pixel * memory_multiplier
        if memory_per_image == 0:
            return 32  # Fallback for invalid calculations

        # Calculate theoretical batch size
        batch_size = int(target_memory // memory_per_image)
        print(f"Batch size before constraints: {batch_size}")
        # Apply practical constraints
        batch_size = max(min(batch_size, 512), 8)  # More conservative limits
        
        print(f"Calculated batch size: {batch_size} "
            f"(Image size: {image_size}, Multiplier: {memory_multiplier}x)")
        return batch_size

    def _train_model_sync(self, model, game_id: str, image_size: int, abort_event: threading.Event) -> str:
        try:
            os.makedirs(f"models/{game_id}", exist_ok=True)
            optimal_batch_size = self.get_optimal_batch_size(image_size)
            print(f"Optimal batch size: {optimal_batch_size}")
            results = model.train(
                data=f"{self.dataset_dir}/{game_id}",
                imgsz=image_size,
                epochs=12,
                batch=optimal_batch_size,
                workers=0,
                device=0,
                project=f"models/{game_id}",
                plots=True,
                verbose=False
            )

            if abort_event.is_set():
                raise TrainingAbortedError("Training aborted", "Training stopped by server request")
            
            # Use run_coroutine_threadsafe to send progress from sync context
            asyncio.run_coroutine_threadsafe(
                self.send_training_progress(85, game_id),
                self._loop
            ).result()
            
            csv_path = os.path.join(str(results.save_dir), "results.csv")
            concurrent_count = ModelTrainingService._active_trainings - 1
        
            stats = convert_dict_to_camel_case(
                map_training_data(
                    results,
                    read_training_csv(csv_path),
                    model,
                    concurrent_trainings=concurrent_count
                )
            )

            asyncio.run_coroutine_threadsafe(
                self.httpx_service.get_api_client().post(
                    f"game/{game_id}/model-training/statistics",
                    json=stats
                ),
                self._loop
            ).result()
            
            asyncio.run_coroutine_threadsafe(
                self.send_training_progress(90, game_id),
                self._loop
            ).result()

            model.export(
                format="tflite",
                batch=1,
                imgsz=image_size,
                rect=True,
                project=f"models/{game_id}"
            )
            
            return str(results.save_dir) + "\\weights\\best_saved_model\\best_float32.tflite"

        except Exception as e:
            if abort_event.is_set():
                raise TrainingAbortedError("Training aborted", "Training stopped by server request") from e
            raise