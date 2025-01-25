from fastapi import APIRouter, Depends, HTTPException

from dependecies.dependency_injection import get_lobby_service
from services.lobby_service import LobbyService


router = APIRouter()

@router.post("/create_lobby")
async def create_lobby(lobby_service: LobbyService = Depends(get_lobby_service)):
    lobby = await lobby_service.create_lobby()
    print(f"Created lobby with ID: {lobby.lobby_id}")
    return {"lobby_id": lobby.lobby_id}

@router.post("/{lobby_id}/add-player/{player_id}")
async def add_player(lobby_id: str, player_id: str, lobby_service: LobbyService = Depends(get_lobby_service)):
    return await lobby_service.add_player(lobby_id, player_id)

@router.get("/{lobby_id}")
async def get_lobby(lobby_id: str, lobby_service: LobbyService = Depends(get_lobby_service)):
    if not lobby_service.is_lobby_exists(lobby_id):
        raise HTTPException(status_code=404, detail="Lobby not found")
    return await lobby_service.get_lobby(lobby_id)

@router.delete("/{lobby_id}")
async def delete_lobby(lobby_id: str, lobby_service: LobbyService = Depends(get_lobby_service)):
    if not lobby_service.is_lobby_exists(lobby_id):
        raise HTTPException(status_code=404, detail="Lobby not found")
    lobby_service.delete_lobby(lobby_id)
    return {"message": f"Lobby {lobby_id} deleted successfully"}
