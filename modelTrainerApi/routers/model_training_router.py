import asyncio
from fastapi import APIRouter, Depends, UploadFile, File

from dependecies.dependency_injection import get_data_collecting_service, get_model_training_service
from services.model_training_service import ModelTrainingService
from utils.jwt_handler import verify_jwt

router = APIRouter()

@router.post("/{game_id}/start-training")
async def upload_training_photo(
    game_id: str,
    model_training_service: ModelTrainingService = Depends(get_model_training_service),
):
    print('Starting training...')
    asyncio.create_task(model_training_service.train(game_id))
    return {"status": "success", "message": "Training process started"}
