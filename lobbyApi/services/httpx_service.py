import httpx
from datetime import timedelta
from utils.jwt_handler import create_jwt

API_BASE_URL = "http://localhost:3000"
MODEL_TRAINING_API_BASE_URL = "http://localhost:7000/model-trainer-api"


class HTTPXService:
    _instance = None

    def __new__(cls, *args, **kwargs):
        if not cls._instance:
            cls._instance = super(HTTPXService, cls).__new__(cls)
        return cls._instance

    def __init__(self):
        # Check if already initialized to avoid reinitializing on subsequent instantiations
        if hasattr(self, "_initialized") and self._initialized:
            return

        self.api_client = httpx.AsyncClient(
            base_url=API_BASE_URL,
            headers={
                "Accept": "application/json",
                "Content-Type": "application/json",
            }
        )


        self._initialized = True

    def add_auth_header(self, request: httpx.Request):
        token = create_jwt(expires_delta=timedelta(minutes=15))
        request.headers["Authorization"] = f"Bearer {token}"
        return request

    def get_api_client(self):
        self.api_client.auth = self.add_auth_header
        return self.api_client
