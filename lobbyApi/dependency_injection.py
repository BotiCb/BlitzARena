from fastapi import Depends
from lobbyApi.services.httpx_service import HTTPXService
from services.game_service import GameService

# Create a singleton instance of GameService
game_service_instance = GameService()

def get_game_service() -> GameService:
    """
    Dependency to get the singleton instance of GameService.
    """
    return game_service_instance


httpx_service = HTTPXService()

def get_httpx_service() -> HTTPXService:
    return httpx_service
