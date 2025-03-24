# game_context.py
from typing import List
from fastapi import HTTPException
from models.location import GameArea
from models.player import Player
from services.websocket_service import WebSocketService

class GameContext:        
    def __init__(
        self,
        transition_to_phase_callback: callable,
        get_current_phase: callable,
        get_game_id: callable,
        is_model_trained: callable,
    ):
        self.websockets = WebSocketService()
        self._transition_to_phase = transition_to_phase_callback
        self._get_current_phase = get_current_phase
        self.get_game_id = get_game_id
        self._is_model_trained = is_model_trained
        self.players: List[Player] = []
        self.game_area : GameArea = None
        self.teams = ['red', 'blue']



    def get_player(self, player_id: str) -> Player:
        for player in self.players:
            if player.id == player_id:
                return player
        raise HTTPException(status_code=404, detail="Player not found")

    def is_host(self, player_id: str) -> bool:
        return self.get_player(player_id).is_host

    @property
    def current_phase(self) -> str:
        return self._get_current_phase()

    async def transition_to_phase(self, phase: str):
        await self._transition_to_phase(phase)

    def is_all_players_ready(self) -> bool:
        return all(player.is_ready for player in self.players)
    
    
    def is_model_trained(self) -> bool:
        return self._is_model_trained
    
    def get_players_in_team(self, team: str) -> List[Player]:
        return [player for player in self.players if player.get_team() == team]
    
    