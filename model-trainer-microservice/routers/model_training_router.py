import asyncio
from fastapi import APIRouter, Depends, UploadFile, File

from dependecies.dependency_injection import get_data_collecting_service, get_model_training_service
from services.model_training_service import ModelTrainingService
from utils.jwt_handler import verify_jwt

router = APIRouter()

@router.post("/{game_id}/start-training/{image_size}")
async def start_training(
    game_id: str,
    image_size: int,
    model_training_service: ModelTrainingService = Depends(get_model_training_service),
):
    print('Starting training...')
    asyncio.create_task(model_training_service.train(game_id, image_size))
    return {"status": "success", "message": "Training process started"}
