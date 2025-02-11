from fastapi import FastAPI

from routers import data_collecting_router


app = FastAPI()

app.include_router(data_collecting_router.router, prefix="/model-trainer-api/collect-data", tags=["Data Collection"])

@app.get("/")
async def root():
    return {"message": "FastAPI WebSocket Backend is running!"}