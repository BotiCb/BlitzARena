from fastapi import FastAPI

from routers import model_training_router
from routers import data_collecting_router

app = FastAPI()

app.include_router(data_collecting_router.router, prefix="/model-trainer-api/collect-data", tags=["Data Collection"])
app.include_router(model_training_router.router, prefix="/model-trainer-api/training", tags=["Model Training"])


@app.get("/model-trainer-api")
async def root():
    return {"message": "FastAPI Model Trainer Backend is running!"}
