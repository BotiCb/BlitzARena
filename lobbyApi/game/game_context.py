# game_context.py
from typing import List
from fastapi import HTTPException
from models.player import Player
from services.websocket_service import WebSocketService

class GameContext:
    def __init__(
        self,
        websockets: WebSocketService,
        players: List[Player],
        transition_to_phase_callback: callable,
        get_current_phase: callable
    ):
        self.websockets = websockets
        self.players = players
        self._transition_to_phase = transition_to_phase_callback
        self._get_current_phase = get_current_phase

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