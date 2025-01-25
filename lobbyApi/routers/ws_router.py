from fastapi import APIRouter, WebSocket, WebSocketDisconnect, HTTPException, Depends

from dependecies.dependency_injection import get_lobby_service
from services.lobby_service import LobbyService


router = APIRouter()

@router.websocket("/{lobby_id}/player/{player_id}")
async def websocket_endpoint(websocket: WebSocket, lobby_id: str, player_id: str, lobby_service: LobbyService = Depends(get_lobby_service)):
    await websocket.accept()
    print(f"Player {player_id} attempting to connect to lobby {lobby_id}")

    try:
        if not lobby_service.is_lobby_exists(lobby_id):
            raise HTTPException(status_code=404, detail="Lobby not found")

        if not lobby_service.lobbies[lobby_id].is_player_in_lobby(player_id):
            raise HTTPException(status_code=400, detail="Player not in this lobby")

        await lobby_service.add_websocket_connection(lobby_id, player_id, websocket)
        print(f"Player {player_id} connected to lobby {lobby_id}")

        while True:
            data = await websocket.receive_json()
            print(f"Received message from player {player_id}: {data}")
            await lobby_service.handle_websocket_message(lobby_id, websocket, data)

    except WebSocketDisconnect:
        await lobby_service.remove_websocket_connection(lobby_id, player_id)
        print(f"Player {player_id} disconnected from lobby {lobby_id}")

    except Exception as e:
        await websocket.send_json({"error": "An unexpected error occurred"})
        await websocket.close()
        print(f"Unexpected error: {e}")
