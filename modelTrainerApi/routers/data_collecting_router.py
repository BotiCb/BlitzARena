from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
import os

from dependecies.dependency_injection import get_data_collecting_service
from services.data_collecting_service import DataCollectingService
from utils.jwt_handler import verify_jwt

router = APIRouter()

@router.post("/upload-training-photo")
async def upload_training_photo(
    game_id: str = Form(...),
    player_id: str = Form(...),
    file: UploadFile = File(...),
    data_collecting_service: DataCollectingService = Depends(get_data_collecting_service),
):
    return await data_collecting_service.save_photo(game_id, player_id, file)
