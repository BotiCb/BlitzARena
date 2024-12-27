import asyncio
import websockets

from services.model_training_service import ModelTrainingService
from services.websocket.websocket_service import WebSocketService





# Main coroutine
async def main():
    print("Starting game server...")
    websocket_service = WebSocketService()
    model_training_service = ModelTrainingService()
    server = await websockets.serve(websocket_service.handle_connection, "0.0.0.0", 8765, max_size=None, max_queue=None)
    print("WebSocket server started on ws://0.0.0.0:8765")
    await server.wait_closed()

if __name__ == "__main__":
    asyncio.run(main())
