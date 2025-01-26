from fastapi import APIRouter, Depends, HTTPException

from dependecies.dependency_injection import get_game_service
from services.game_service import GameService


router = APIRouter()

@router.post("/create_game")
async def create_game(game_service: GameService = Depends(get_game_service)):
    game = await game_service.create_game()
    print(f"Created game with ID: {game.game_id}")
    return {"game_id": game.game_id}

@router.post("/{game_id}/add-player/{player_id}")
async def add_player(game_id: str, player_id: str, game_service: GameService = Depends(get_game_service)):
    return await game_service.add_player(game_id, player_id)

@router.get("/{game_id}")
async def get_game(game_id: str, game_service: GameService = Depends(get_game_service)):
    if not game_service.is_game_exists(game_id):
        raise HTTPException(status_code=404, detail="Game not found")
    return await game_service.get_game(game_id)

@router.delete("/{game_id}")
async def delete_game(game_id: str, game_service: GameService = Depends(get_game_service)):
    if not game_service.is_game_exists(game_id):
        raise HTTPException(status_code=404, detail="Game not found")
    game_service.delete_game(game_id)
    return {"message": f"Game {game_id} deleted successfully"}
