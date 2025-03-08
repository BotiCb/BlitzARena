from typing import Dict
from game_phase_services.match_phase_services.match_pase_abstract_service import MatchPhaseAbstractService
from game_phase_services.phase_abstract_service import PhaseAbstractService
from game.game_context import GameContext
from game_phase_services.match_phase_services.round_waiting_phase_service import RoundWaitingService
from game_phase_services.match_phase_services.match_context import MatchContext
from models.message import Message



class MatchService(PhaseAbstractService):
    
    def __init__(self, context: GameContext):
        super().__init__(context)
        self.current_round = 0
        self.total_rounds = 10
        self.match_context = MatchContext(game_context=context,
                                          transition_to_match_phase_callback=self.trainsition_to_match_phase,
                                          get_round_number_callback= lambda: self.current_round,
                                          increment_round_callback=self.increment_round
                                          )
        self.match_phases_services: Dict[str, MatchPhaseAbstractService] = {
            "waiting-for-players": RoundWaitingService(self.match_context),
            # "battle": RoundBattleService(context)
        }
        
        self.current_match_phase = "waiting-for-players"
        self.current_match_phase_service = self.match_phases_services[self.current_match_phase]
        
    def on_enter(self):
        """Register lobby-specific WebSocket handlers."""
        self._register_handlers()

    def on_exit(self):
        """Unregister handlers when leaving the lobby."""
        self._unregister_handlers()

    def _register_handlers(self):
        self.context.websockets.register_handler("player_location", self.on_player_position)
        

            
    async def on_player_ready_to_phase(self, player_id):
        await self.context.websockets.send_to_player(player_id, Message({"type": "match_phase_info", "data": {
            "current_round": self.current_round,
            "total_rounds": self.total_rounds,
            "current_phase": self.current_match_phase,
            "ends_at": self.current_match_phase_service.ends_at
        }}))
        
        
    async def on_player_position(self, player_id: str, message: dict):
        await self.current_match_phase_service.on_player_position(player_id, message)
        
        
    async def trainsition_to_match_phase(self, phase: str):
        if self.current_match_phase_service:
            self.current_match_phase_service.on_exit()
        self.current_match_phase = phase
        self.current_match_phase_service = self.match_phases_services.get(phase)
        
        if self.current_match_phase_service:
            self.current_match_phase_service.on_enter()
            
        await self.context.websockets.send_to_all(
            Message({"type": "match_phase", "data": {
                "current_round": self.current_round,
                "current_phase": self.current_match_phase
            }})
        )
        
    def increment_round(self):
        self.current_round += 1



    