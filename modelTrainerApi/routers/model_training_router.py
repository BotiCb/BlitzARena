import asyncio
from fastapi import APIRouter, Depends, UploadFile, File

from dependecies.dependency_injection import get_data_collecting_service, get_model_training_service
from modelTrainerApi.services.model_training_service import ModelTrainingService
from utils.jwt_handler import verify_jwt

router = APIRouter()

@router.post("/{game_id}/{player_id}/start-training")
async def upload_training_photo(
    game_id: str,
    payload: dict = Depends(verify_jwt),
    model_training_service: ModelTrainingService = Depends(get_model_training_service),
):
    print('Starting training...')
    return asyncio.create_task( model_training_service.train(game_id))
