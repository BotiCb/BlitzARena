

from services.model_training_service import ModelTrainingService
from services.data_collecting_service import DataCollectingService

# Create a singleton instance of GameService
data_collecting_service = DataCollectingService()
model_training_service = ModelTrainingService()


def get_data_collecting_service() -> DataCollectingService:
    return data_collecting_service


def get_model_training_service() -> ModelTrainingService:
    return model_training_service