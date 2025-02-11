from fastapi import APIRouter, Depends, UploadFile, File

from dependecies.dependency_injection import get_data_collecting_service
from services.data_collecting_service import DataCollectingService
from utils.jwt_handler import verify_jwt

router = APIRouter()

@router.post("/{game_id}/{player_id}/upload-training-photo")
async def upload_training_photo(
    game_id: str,
    player_id: str,
    file: UploadFile = File(...),
    payload: dict = Depends(verify_jwt),
    data_collecting_service: DataCollectingService = Depends(get_data_collecting_service),
):
    print('Training photo received')
    return await data_collecting_service.save_photo(game_id, player_id, file)
