# lobby_service.py
from typing import List
from game.game_context import GameContext
from game_phase_services.phase_abstract_service import PhaseAbstractService
from utils.area_validation import validate_area
from models.location import GameArea, TeamBase
from models.player import Coordinates
from models.message import Message


class GameRoomService(PhaseAbstractService):
    def __init__(self, context: GameContext):
        super().__init__(context)

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
        self.context.websockets.register_handler("game_area_change", self.on_game_area_change)
        self._registered_handlers.extend(["set_player_ready", "start_next_phase", "select_team", "player_location", "game_area_change"])



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
        teams = self.context.teams
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
        await self.send_game_area(player_id)
        
        
    async def on_player_team_select(self, player_id: str, message: dict):
        player = self.context.get_player(player_id)
        team = message.get("team")
        if player.is_ready:
            await self.context.websockets.send_to_player(
                player_id,
                Message({"type": "error", "data": "You cannot select a team while you are ready"})
            )
            return
        
        if team not in self.context.teams:
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
            longitude = message.get("longitude")
            latitude = message.get("latitude")
            self.context.get_player(player_id).set_coordinates(Coordinates(longitude, latitude))
            if self.context.game_area:
                return  
            
            if longitude is None or latitude is None:
                raise ValueError("Longitude and latitude must be provided.")
            
            
            
            players_with_location_count = sum(1 for p in self.context.players if p.get_coordinates() is not None)
            required = (len(self.context.players)) // 2 + 1
            if players_with_location_count >= required:
                self.calculate_initial_game_area()
                await self.send_game_area()
        except (KeyError, ValueError) as e:
            await self.context.websockets.send_error(player_id, f"Error: {e}")
                
    async def send_game_area(self, player_id: str = None):
        if not self.context.game_area:
            return
        
        game_area_dict = self.context.game_area.to_dict()
        
        if player_id:
            await self.context.websockets.send_to_player(player_id,
                Message({"type": "game_area", "data": game_area_dict})
            )
            return
        
        await self.context.websockets.send_to_all(
            Message({"type": "game_area", "data": game_area_dict})
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
        delta = 0.0009
        half_delta = delta / 2

        edges = [
            Coordinates(center.longitude + half_delta, center.latitude + half_delta),
            Coordinates(center.longitude + half_delta, center.latitude - half_delta),
            Coordinates(center.longitude - half_delta, center.latitude - half_delta),
            Coordinates(center.longitude - half_delta, center.latitude + half_delta),
        ]

        # Corrected team_bases structure
        team_bases = [
           TeamBase(
            coordinates=Coordinates(center.longitude + half_delta / 2, center.latitude), 
            team="blue"
        ),
        TeamBase(
            coordinates=Coordinates(center.longitude - half_delta / 2, center.latitude), 
            team="red"
        ),
        ]

        self.context.game_area = GameArea(edges=edges, team_bases=team_bases)
        
            
    async def on_game_area_change(self, player_id: str, message: dict):
        player = self.context.get_player(player_id)
        if not player.is_host:
            await self.context.websockets.send_to_player(
                player_id,
                Message({"type": "error", "data": "You are not the host"})
            )
            await self.send_game_area(player_id)
            return
        
        if not player.coordinates:
            await self.context.websockets.send_to_player(
                player_id,
                Message({"type": "error", "data": "You must set your position first"})
            )
            await self.send_game_area(player_id)
            return

        edges_data = message.get("edges")
        team_bases_data = message.get("team_bases")

        try:
            # Convert edges data to Coordinates
            edges = [
                Coordinates(edge["longitude"], edge["latitude"])
                for edge in edges_data
            ]

            # Convert team bases to TeamBase objects
            team_bases = []
            for tb in team_bases_data:
                coords_data = tb["coordinates"]
                coordinates = Coordinates(
                    longitude=coords_data["longitude"],
                    latitude=coords_data["latitude"]
                )
                team_base = TeamBase(coordinates=coordinates, team=tb["team"])
                team_bases.append(team_base)

            # Create GameArea instance
            game_area = GameArea(edges=edges, team_bases=team_bases)

            # Validate the new area
            if not validate_area(player.get_coordinates(), game_area):
                await self.context.websockets.send_to_player(
                    player_id,
                    Message({"type": "error", "data": "Invalid game area."})
                )
                await self.send_game_area(player_id)
                return

            self.context.game_area = game_area
            await self.send_game_area()

        except (KeyError, TypeError) as e:
            await self.context.websockets.send_error(player_id, f"Invalid data: {str(e)}")
            print(f"Error while changing game area: {str(e)}")
        
        
            
        