from fastapi import FastAPI

from routers import game_router, ws_router


app = FastAPI()

app.include_router(game_router.router, prefix="/api/game", tags=["Game"])
app.include_router(ws_router.router, prefix="/ws", tags=["WebSocket"])

@app.get("/")
async def root():
    return {"message": "FastAPI WebSocket Backend is running!"}