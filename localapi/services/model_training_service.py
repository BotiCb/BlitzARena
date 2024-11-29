from services.websocket.websocket_service import WebSocketService


class ModelTrainingService:
    def __init__(self):
        self.websocket_service = WebSocketService()
        self.websocket_service.
        self.websocket_service.register_message_handler("train_model", self.train_model)