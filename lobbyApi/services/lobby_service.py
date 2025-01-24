import uuid
from services.websocket_service import WebSocketService
from fastapi import WebSocket, HTTPException
from fastapi import Depends





class LobbyService:
    _instance = None  # Class-level variable for the singleton instance

    def __new__(cls, *args, **kwargs):
        """Override the __new__ method to ensure only one instance of LobbyService is created."""
        if cls._instance is None:
            cls._instance = super().__new__(cls, *args, **kwargs)
        return cls._instance

    def __init__(self):
        if not hasattr(self, "initialized"):  # Prevent re-initialization
            # This ensures that the initialization code runs only once
            self.lobbies = {}  # Initialize the lobbies dictionary
            self.initialized = True  # Mark as initialized
        else:
            pass  # {lobby_id (UUID): {"websockets": WebSocketService, "players": []}}

    def generate_lobby_id(self) -> str:
        """Generate a unique lobby ID using UUID."""
        return str(uuid.uuid4())
    def isLobbyExists(self, lobby_id: str):
        return lobby_id in self.lobbies

    async def create_lobby(self):
        # Create a new lobby with a unique UUID
        lobby_id = self.generate_lobby_id()
        self.lobbies[lobby_id] = {"websockets": WebSocketService(), "players": []}
        return {"lobby_id": lobby_id}

    async def add_player(self, lobby_id: str, player_id: str):
        if not self.isLobbyExists(lobby_id):
            raise HTTPException(status_code=404, detail="Lobby not found")

        self.lobbies[lobby_id]["players"].append(player_id)
        return {"message": f"Player {player_id} added to lobby {lobby_id}"}


    async def remove_player(self, lobby_id: str, player_id: str):
        if self.isLobbyExists(lobby_id):
            raise HTTPException(status_code=404, detail="Lobby not found")

        if self.is_player_in_lobby(lobby_id, player_id):
            self.lobbies[lobby_id]["players"].remove(player_id)
            return {"message": f"Player {player_id} removed from lobby {lobby_id}"}
        else:
            raise HTTPException(status_code=400, detail="Player not in this lobby")


    async def get_lobby(self, lobby_id: str):
        """Get details of a specific lobby by its UUID."""
        if not self.isLobbyExists(lobby_id):
            raise HTTPException(status_code=404, detail="Lobby not found")
        return self.lobbies[lobby_id]

    async def is_player_in_lobby(self, lobby_id: str, player_id: str) -> bool:
        """Check if a player is already added to the lobby."""
        if lobby_id in self.lobbies:
            return player_id in self.lobbies[lobby_id]["players"]
        return False

    async def add_websocket_connection(self, lobby_id: str, player_id: str, websocket: WebSocket):
        """Add a WebSocket connection for a player to the lobby."""
        if lobby_id in self.lobbies:
            # Check if the player is already in the lobby before adding the WebSocket connection
            if await self.is_player_in_lobby(lobby_id, player_id):
                await self.lobbies[lobby_id]["websockets"].add_connection(player_id, websocket)
                return {"message": f"Player {player_id} connected to lobby {lobby_id}"}
            else:
                raise HTTPException(status_code=400, detail="Player not in this lobby")
        raise HTTPException(status_code=404, detail="Lobby not found")

    async def remove_websocket_connection(self, lobby_id: str, player_id: str):
        """Remove a WebSocket connection for a player from the lobby."""
        if lobby_id in self.lobbies:
            await self.lobbies[lobby_id]["websockets"].remove_connection(player_id)

    async def handle_websocket_message(self, lobby_id: str, websocket: WebSocket, message: dict):
        """Handle incoming messages from a player in the WebSocket connection."""
        if 'player_id' in message and message['action'] == "send_message_to_player":
            player_id = message['player_id']
            msg_content = message['content']
            await self.lobbies[lobby_id]["websockets"].send_to_player(player_id, {"message": msg_content})
        elif message['action'] == "broadcast":
            await self.lobbies[lobby_id]["websockets"].send_to_all(message)
        else:
            print("Unknown action or missing player ID")

    async def delete_lobby(self, lobby_id: str):
        """Delete a lobby and remove all its connections."""
        if not self.isLobbyExists(lobby_id):
            raise HTTPException(status_code=404, detail="Lobby not found")
        lobby = self.lobbies[lobby_id]
        for player_id in lobby["players"]:
            await lobby["websockets"].remove_connection(player_id)
        # Remove the lobby
        del self.lobbies[lobby_id]
        return {"message": f"Lobby {lobby_id} deleted successfully"}
