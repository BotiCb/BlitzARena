from datetime import datetime, timedelta
import asyncio
from game_phase_services.match_phase_services.match_pase_abstract_service import MatchPhaseAbstractService
from game_phase_services.match_phase_services.match_context import MatchContext
from models.player import Player
from models.message import Message

class BattleMatchPhaseService(MatchPhaseAbstractService):
    def __init__(self, context: MatchContext):
        super().__init__(context)
        self._countdown_task = None  # To keep reference to the background task

    async def on_enter(self):
        self.register_handlers()
        """Start battle phase with 3-minute timer in the background"""
        time_delta = timedelta(seconds=180)
        self.ends_at = datetime.now() + time_delta
        # Start non-blocking countdown
        self._countdown_task = asyncio.create_task(self._run_countdown(time_delta))
        for player in self.context.game_context.players:
            player.gun.load_ammo(30)
            await self.context.game_context.websockets.send_to_player(player.id, Message({"type": "gun_info", "data":  player.gun.to_dict()
            }))
            
    def register_handlers(self):
        self.context.game_context.websockets.register_handler("player_shoot", self.handle_player_shoot)
        self.context.game_context.websockets.register_handler("player_reload", self.handle_player_reload)

    async def _run_countdown(self, duration: timedelta):
        """Background task to handle phase duration"""
        await asyncio.sleep(duration.total_seconds())
        await self.context.transition_to_match_phase("waiting-for-players")

    def on_exit(self):
        """Clean up resources when exiting phase"""
        if self._countdown_task and not self._countdown_task.done():
            self._countdown_task.cancel()
        self.ends_at = None

    async def handle_player_position_change(self, player: Player):
        """Handle player movements during battle"""
        # Add battle-specific position logic here
        pass
    
    
    async def handle_player_shoot(self, playerId: str, message: dict):
        try:
            player = self.context.game_context.get_player(playerId)
            if player.health_points <= 0:
                raise Exception("Player is dead")
        
            dmg = player.gun.shoot()
        finally:
            await self.context.game_context.websockets.send_to_player(playerId, Message({"type": "gun_info", "data":  player.gun.to_dict()}))
        hit_player_id = message.get("hit_player_id", None)
        if hit_player_id is None:
            return
        hit_player = self.context.game_context.get_player(message.get("hit_player_id"))
        hit_player.take_damage(dmg)
        
    async def handle_player_reload(self, playerId: str, message: dict):
        try:
            player = self.context.game_context.get_player(playerId)
            
            if player.health_points <= 0:
                raise Exception("Player is dead")
            
            player.gun.reload()
        finally:
            await self.context.game_context.websockets.send_to_player(playerId, Message({"type": "gun_info", "data":  player.gun.to_dict()}))
        
        
        
    async def send_hp_info(self, player: Player):
        await self.context.game_context.websockets.send_to_all(Message({"type": "hp_info", "data": {
            "hp": player.health_points
        }}))