import httpx
from datetime import timedelta
from lobbyApi.utils.jwt_handler import create_jwt

API_BASE_URL = "http://localhost:3000"
MODEL_TRAINING_API_BASE_URL = "http://localhost:7000/model-trainer-api"

class HTTPXService:
    def __init__(self):
        self.api_client = httpx.AsyncClient(base_url=API_BASE_URL, headers={
            "Accept": "application/json",
            "Content-Type": "application/json",
        })

        self.model_training_api_client = httpx.AsyncClient(base_url=MODEL_TRAINING_API_BASE_URL, headers={
            "Accept": "application/json",
            "Content-Type": "application/json",
        })

    async def add_auth_header(self, request: httpx.Request):
        token = create_jwt(expires_delta=timedelta(minutes=15))
        request.headers["Authorization"] = f"Bearer {token}"
        return request

    async def get_api_client(self):
        self.api_client.auth = self.add_auth_header
        return self.api_client

    async def get_model_training_client(self):
        self.model_training_api_client.auth = self.add_auth_header
        return self.model_training_api_client
