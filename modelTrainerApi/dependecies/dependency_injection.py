from fastapi import Depends
from services.data_collecting_service import DataCollectingService

# Create a singleton instance of GameService
data_collecting_service = DataCollectingService()


def get_data_collecting_service() -> DataCollectingService:
    return data_collecting_service