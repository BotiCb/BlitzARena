from fastapi import APIRouter
from services.lobby_service import LobbyService

router = APIRouter()

lobby_service = LobbyService()

@router.post("/create")
async def create_lobby():
    return await lobby_service.create_lobby()

@router.post("/{lobby_id}/add-player/{player_id}")
async def add_player(lobby_id: str, player_id: str):
    return await lobby_service.add_player(lobby_id, player_id)

@router.get("/{lobby_id}")
async def get_lobby(lobby_id: str):
    return await lobby_service.get_lobby(lobby_id)


@router.delete("/{lobby_id}")
async def delete_lobby(lobby_id: str):
    return await lobby_service.delete_lobby(lobby_id)
