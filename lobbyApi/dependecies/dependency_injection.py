from fastapi import Depends
from services.lobby_service import LobbyService

# Create a singleton instance of LobbyService
lobby_service_instance = LobbyService()

def get_lobby_service() -> LobbyService:
    """
    Dependency to get the singleton instance of LobbyService.
    """
    return lobby_service_instance
