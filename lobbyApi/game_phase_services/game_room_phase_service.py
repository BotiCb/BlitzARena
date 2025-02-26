# lobby_service.py
from typing import List
from game.game_context import GameContext
from game_phase_services.phase_service import PhaseService
from models.player import Coordinates
from models.message import Message


class GameRoomService(PhaseService):
    def __init__(self, context: GameContext):
        super().__init__(context)
        self.game_area : List[Coordinates]  = []

    def on_enter(self):
        """Register lobby-specific WebSocket handlers."""
        self._register_handlers()

    def on_exit(self):
        """Unregister handlers when leaving the lobby."""
        self._unregister_handlers()

    def _register_handlers(self):
        self.context.websockets.register_handler("set_player_ready", self.set_player_ready)
        self.context.websockets.register_handler("start_next_phase", self.start_match)
        self.context.websockets.register_handler("select_team", self.on_player_team_select)
        self.context.websockets.register_handler("player_location", self.on_player_position)

        self._registered_handlers.extend(["set_player_ready", "start_next_phase"])



    async def set_player_ready(self, player_id: str, message: dict):
        player = self.context.get_player(player_id)
        if  not self.context.is_model_trained():
            await self.context.websockets.send_to_player(
                player_id,
                Message({"type": "error", "data": "Model is not trained yet"})
            )
            return
        is_ready = message.get("is_ready", False)
        player.set_ready(is_ready)
        await self.context.websockets.send_to_all(
            Message({"type": "player_status", "data": {"is_ready": is_ready, "player_id": player_id}})
        )

    async def start_match(self, player_id: str, message: dict):
        if not self.context.is_host(player_id) :
            await self.context.websockets.send_to_player(
                player_id,
                Message({"type": "error", "data": "Only the host can start the game"})
            )
            return
            
        if not self.context.is_all_players_ready():
            await self.context.websockets.send_to_player(
                player_id,
                Message({"type": "error", "data": "Not all players are ready"})
            )
            return
        
        if not self.context.is_model_trained():
            await self.context.websockets.send_to_player(
                player_id,
                Message({"type": "error", "data": "Model is not trained yet"})
            )
            return
        
        #check if none of the teams has 0 players, team contains thw name of the team, there are more teams not just 2
        teams = self.context.get_teams()
        if any(len(self.context.get_players_in_team(team)) == 0 for team in teams):
            await self.context.websockets.send_to_player(
                player_id,
                Message({"type": "error", "data": "At least one team has no players"})
            )
            return
        
        await self.context.transition_to_phase("match")
                
        
        

    
    
    async def on_player_ready_to_phase(self, player_id: str) -> None:
        players_ready = [{"player_id": player.id, "is_ready": player.is_ready} for player in self.context.players]
        print (f"Players ready: {players_ready}")
        await self.context.websockets.send_to_player(
            player_id,
            Message({"type": "game_room_phase_info", "data": players_ready})
        )
        
        
    async def on_player_team_select(self, player_id: str, message: dict):
        player = self.context.get_player(player_id)
        team = message.get("team")
        if player.is_ready:
            await self.context.websockets.send_to_player(
                player_id,
                Message({"type": "error", "data": "You cannot select a team while you are ready"})
            )
            return
        
        if team not in self.context.get_teams():
            await self.context.websockets.send_to_player(
                player_id,
                Message({"type": "error", "data": "Invalid team selection"})
            )
            return
        
        if player.get_team() == team:
            await self.context.websockets.send_to_player(
                player_id,
                Message({"type": "error", "data": "You have already selected this team"})
            )
            return
        
        player.set_team(team)
        await self.context.websockets.send_to_all(
            Message({"type": "player_team_selected", "data": {"player_id": player_id, "team": team}})
        )
        
    async def on_player_position(self, player_id: str, message: dict):
        try:
            print(message)
            longitude = message.get("longitude")
            latitude = message.get("latitude")
            
            # Ensure longitude and latitude are valid numbers
            if longitude is None or latitude is None:
                raise ValueError("Longitude and latitude must be provided.")
            
            
            self.context.get_player(player_id).set_coordinates(Coordinates(longitude, latitude))
            
          
            players_with_location_count = sum(1 for player in self.context.players if player.get_coordinates() is not None)
            if players_with_location_count == len(self.context.players) / 2 + 1:
                self.calculate_initial_game_area()
                await self.send_game_area()

        except (KeyError, ValueError) as e:
            await self.context.websockets.send_error(player_id, f"Error: {e}")
            
            
    async def send_game_area(self):
        print (self.game_area)
        await self.context.websockets.send_to_all(
            Message({"type": "game_area", "data": self.game_area})
        )
        
    def calculate_game_center(self):
        coordinates = [player.get_coordinates() for player in self.context.players if player.get_coordinates() is not None]
   
        if not coordinates:
            raise ValueError("No valid player coordinates found.")

        longitude = sum(coord.longitude for coord in coordinates) / len(coordinates)
        latitude = sum(coord.latitude for coord in coordinates) / len(coordinates)
        
        center = Coordinates(longitude, latitude)
        print(f"Calculated center: {center}")
        return center
    
    def calculate_initial_game_area(self):
        center = self.calculate_game_center()
        delta = 0.2*0.009
        half_delta = delta / 2
        self.game_area = [
            Coordinates(center.longitude + half_delta, center.latitude + half_delta),
            Coordinates(center.longitude + half_delta, center.latitude - half_delta),
            Coordinates(center.longitude - half_delta, center.latitude - half_delta),
            Coordinates(center.longitude - half_delta, center.latitude + half_delta),
        ]
        