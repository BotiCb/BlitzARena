from fastapi import APIRouter, WebSocket, WebSocketDisconnect, HTTPException

from services.lobby_service import LobbyService

router = APIRouter()
lobby_service = LobbyService()


@router.websocket("/{lobby_id}/player/{player_id}")
async def websocket_endpoint(websocket: WebSocket, lobby_id: str, player_id: str):
    await websocket.accept()
    print(f"Player {player_id} connecting to lobby {lobby_id} {lobby_service.isLobbyExists(lobby_id)} "
          f"{await lobby_service.is_player_in_lobby(lobby_id, player_id)}")
    try:

        if not lobby_service.isLobbyExists(lobby_id):
            raise HTTPException(status_code=404, detail="Lobby not found")
        # Validate if the player is in the lobby
        if not await lobby_service.is_player_in_lobby(lobby_id, player_id):
            raise HTTPException(status_code=400, detail="Player not in this lobby")

        # Add the player's WebSocket connection
        await lobby_service.add_websocket_connection(lobby_id, player_id, websocket)
        print(f"Player {player_id} connected to lobby {lobby_id}")

        # Handle incoming messages
        while True:
            data = await websocket.receive_json()
            await lobby_service.handle_websocket_message(lobby_id, websocket, data)

    except HTTPException as e:
        # Catch and handle HTTP exceptions (e.g., invalid player or lobby)
        await websocket.send_json({"error": e.detail, "code": e.status_code})
        await websocket.close()
        print(f"Connection error: {e.detail}")

    except WebSocketDisconnect:
        # Handle WebSocket disconnect (e.g., client closed connection)
        await lobby_service.remove_websocket_connection(lobby_id, player_id)
        print(f"Player {player_id} disconnected from lobby {lobby_id}")

    except Exception as e:
        # Catch unexpected exceptions (e.g., server-side errors)
        await websocket.send_json({"error": "An unexpected error occurred"})
        await websocket.close()
        print(f"Unexpected error: {e}")
