from fastapi import FastAPI

from routers import lobby_router, ws_router
from services.lobby_service import LobbyService

app = FastAPI()

app.include_router(lobby_router.router, prefix="/api/lobby", tags=["Lobby"])
app.include_router(ws_router.router, prefix="/ws", tags=["WebSocket"])

@app.get("/")
async def root():
    return {"message": "FastAPI WebSocket Backend is running!"}