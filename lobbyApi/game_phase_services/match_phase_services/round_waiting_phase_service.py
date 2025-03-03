import asyncio
from game.game_context import GameContext
from game_phase_services.match_phase_services.match_pase_abstract_service import MatchPhaseAbstractService
from game_phase_services.match_phase_services.match_context import MatchContext
from utils.area_validation import are_coordinates_within_distance
from models.player import Player
from models.message import Message
from datetime import datetime, timedelta

from utils.models import Coordinates, GameArea


class RoundWaitingService(MatchPhaseAbstractService):
    def __init__(self, context: MatchContext):
        super().__init__(context)
        self.countdown_started = False

    def on_enter(self):
        self.context.increment_round()
    
    def on_exit(self):
        pass
    
    async def handle_player_position_change(self, player):
        if self.countdown_started:
            return
        base_coords = self.get_player_team_base_coordinates(player, self.context.game_context.game_area)
        is_player_in_base = are_coordinates_within_distance(player.coordinates, base_coords, 10)
        if is_player_in_base == player.is_ready:
            return
        print (f"Player {player.id} is in base: {is_player_in_base}")
        player.set_ready(is_player_in_base)
        await self.context.game_context.websockets.send_to_all(Message(
            {
                "type": "player_status",
                "data": {
                    "is_ready": is_player_in_base, 
                    "player_id": player.id
                    }
            }
            ))
        if self.context.game_context.is_all_players_ready():
            await self.start_countdown()
               
        
        
    def get_player_team_base_coordinates(self, player: Player, game_area: GameArea) -> Coordinates:
        player_team = player.get_team()
        for team_base in game_area.team_bases:
            if team_base.team == player_team:
                return team_base.coordinates
        raise ValueError(f"No base found for team '{player_team}'")
    
    
    async def start_countdown(self):
        self.countdown_started = True
        time_delta = timedelta(seconds=10)
        await self.context.game_context.websockets.send_to_all(Message({"type": "start_countdown", "data": {
            "ends_at": (datetime.now() + time_delta).isoformat()
        }}))
        
        #wait fot 10 seconds
        await asyncio.sleep(time_delta.total_seconds())
        
        await self.context.transition_to_match_phase("round")
        
    
    
    
    
    
    
    
    
    
    