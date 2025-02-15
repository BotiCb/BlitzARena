from fastapi import APIRouter, Depends, HTTPException

from utils.dto_convention_converter import convert_dict_to_snake_case, convert_dict_to_camel_case
from utils.jwt_handler import verify_jwt
from dependencies.dependency_injection import get_game_service
from services.game_service import GameService

router = APIRouter()

@router.post("/create-game")
async def create_game(
    data: dict,
    payload: dict = Depends(verify_jwt),
    game_service: GameService = Depends(get_game_service)
):
    print(convert_dict_to_snake_case(data))
    game = await game_service.create_game(convert_dict_to_snake_case(data))
    print(f"Created game with ID: {game.game_id} max players: {game.max_players}")
    return convert_dict_to_camel_case(game.get_game_info())

@router.post("/{game_id}/add-player/{player_id}")
async def add_player(
    game_id: str,
    player_id: str,
    game_service: GameService = Depends(get_game_service)
):
    return await game_service.add_player(game_id, player_id)

@router.get("/{game_id}")
async def get_game(
    game_id: str,
    game_service: GameService = Depends(get_game_service)
):
    if not game_service.is_game_exists(game_id):
        raise HTTPException(status_code=404, detail="Game not found")
    return  convert_dict_to_camel_case(game_service.get_game(game_id).get_game_info())

@router.delete("/{game_id}")
async def delete_game(
    game_id: str,
    payload: dict = Depends(verify_jwt),
    game_service: GameService = Depends(get_game_service)
):
    if not game_service.is_game_exists(game_id):
        raise HTTPException(status_code=404, detail="Game not found")
    game_service.delete_game(game_id)
    return {"message": f"Game {game_id} deleted successfully"}