import asyncio
from game.game_context import GameContext
from game_phase_services.match_phase_services.match_pase_abstract_service import MatchPhaseAbstractService
from game_phase_services.match_phase_services.match_context import MatchContext
from utils.area_validation import are_coordinates_within_distance
from models.player import Player
from models.message import Message
from datetime import datetime, timedelta

from models.location import Coordinates, GameArea


class WaitingMatchPhaseService(MatchPhaseAbstractService):
    def __init__(self, context: MatchContext):
        super().__init__(context)
        self._countdown_task = None  # Track background task

    async def on_enter(self):
        self.context.increment_round()
        self.context.reset_health_points_for_all_players()
    
    def on_exit(self):
        # Clean up any running countdown when leaving phase
        if self._countdown_task and not self._countdown_task.done():
            self._countdown_task.cancel()
        self.ends_at = None

    async def handle_player_position_change(self, player):
        if self._countdown_task and not self._countdown_task.done():
            return  # Ignore position changes during active countdown

        base_coords = self.get_player_team_base_coordinates(player, self.context.game_context.game_area)
        is_player_in_base = are_coordinates_within_distance(player.coordinates, base_coords, 25)
        
        if is_player_in_base == player.is_ready:
            return

        print(f"Player {player.id} is in base: {is_player_in_base}")
        player.set_ready(is_player_in_base)
        
        await self.context.game_context.websockets.send_to_all(Message({
            "type": "player_status",
            "data": {
                "is_ready": is_player_in_base, 
                "player_id": player.id
            }
        }))

        if self.context.game_context.is_all_players_ready():
            await self.start_countdown()

    async def start_countdown(self):
        """Start countdown in background without blocking"""
        time_delta = timedelta(seconds=10)
        self.ends_at = datetime.now() + time_delta
        
        # Notify clients
        await self.context.game_context.websockets.send_to_all(Message({
            "type": "start_countdown",
            "data": {
                "ends_at": int(self.ends_at.timestamp()) * 1000
            }
        }))

        # Start background countdown
        self._countdown_task = asyncio.create_task(self._run_countdown(time_delta))

    async def _run_countdown(self, duration: timedelta):
        """Background task to handle countdown"""
        try:
            await asyncio.sleep(duration.total_seconds())
            await self.context.transition_to_match_phase("battle")
        except asyncio.CancelledError:
            # Handle task cancellation if phase changes prematurely
            print("Countdown cancelled")
            
            
    def get_player_team_base_coordinates(self, player: Player, game_area: GameArea) -> Coordinates:
        player_team = player.get_team()
        for team_base in game_area.team_bases:
            if team_base.team == player_team:
                return team_base.coordinates
        raise ValueError(f"No base found for team '{player_team}'")
    
    
    
    
    
    
    
    
    