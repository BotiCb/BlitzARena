from fastapi import APIRouter, WebSocket, WebSocketDisconnect, HTTPException, Depends

from dependecies.dependency_injection import get_game_service
from models.message import Message
from services.game_service import GameService


router = APIRouter()

@router.websocket("/{game_id}/player/{player_id}")
async def websocket_endpoint(websocket: WebSocket, game_id: str, player_id: str, game_service: GameService = Depends(get_game_service)):
    await websocket.accept()
    print(f"Player {player_id} attempting to connect to game {game_id}")

    try:
        if not game_service.is_game_exists(game_id):
            raise HTTPException(status_code=404, detail="Game not found")

        if not game_service.games[game_id].is_player_in_game(player_id):
            raise HTTPException(status_code=400, detail="Player not in this game")

        await game_service.add_websocket_connection(game_id, player_id, websocket)
        print(f"Player {player_id} connected to game {game_id}")

        while True:
            try:
                data = await websocket.receive_json()
                message = Message(data)
                print(f"Received message from player {player_id}: {message.type} - {message.data}")
                await game_service.handle_websocket_message(game_id, websocket, message)
            except ValueError as e:
                await websocket.send_json({"error": "Invalid message format"})

    except WebSocketDisconnect:
        await game_service.remove_websocket_connection(game_id, player_id)
        print(f"Player {player_id} disconnected from game {game_id}")
    except HTTPException as e:
        await websocket.send_json({"error": e.detail})
        await websocket.close()

    except Exception as e:
        await websocket.send_json({"error": "An unexpected error occurred"})
        await websocket.close()
        print(f"Unexpected error: {e}")
