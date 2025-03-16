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
            player.gun.reset()
            player.gun.load_ammo(30)
            await self.context.game_context.websockets.send_to_player(player.id, Message({"type": "gun_info", "data":  player.gun.to_dict()
            }))
            player.revive()
            
    def register_handlers(self):
        self.context.game_context.websockets.register_handler("player_shoot", self.handle_player_shoot)
        self.context.game_context.websockets.register_handler("player_reload", self.handle_player_reload)
        self._registered_handlers.extend(["player_shoot", "player_reload"])

    async def _run_countdown(self, duration: timedelta):
        """Background task to handle phase duration"""
        await asyncio.sleep(duration.total_seconds())
        await self.context.transition_to_match_phase("waiting-for-players")

    def on_exit(self):
        """Clean up resources when exiting phase"""
        if self._countdown_task and not self._countdown_task.done():
            self._countdown_task.cancel()
        self.ends_at = None
        self._countdown_task = None
        self._unregister_handlers()
        

    async def handle_player_position_change(self, player: Player):
        """Handle player movements during battle"""
        # Add battle-specific position logic here
        pass
    
    
    async def handle_player_shoot(self, playerId: str, message: dict):
        try:
            player = self.context.game_context.get_player(playerId)
            if player.is_alive() == False:
                raise Exception("Player is dead")
        
            dmg: int = player.gun.shoot()
            hit_player_id = message.get("hit_player_id", None)
            if hit_player_id is None:
                return
            hit_player = self.context.game_context.get_player(message.get("hit_player_id"))
            await self.handle_player_hit(hit_player, dmg, player)
            
        finally:
            await self.context.game_context.websockets.send_to_player(playerId, Message({"type": "gun_info", "data":  player.gun.to_dict()}))
        
    async def handle_player_reload(self, playerId: str, message: dict):
        try:
            player = self.context.game_context.get_player(playerId)
            
            if player.is_alive() == False:
                raise Exception("Player is dead")
            
            player.gun.reload()
        finally:
            await self.context.game_context.websockets.send_to_player(playerId, Message({"type": "gun_info", "data":  player.gun.to_dict()}))
    
    async def  handle_player_hit(self, hit_player: Player, taken_dmg: int, shoot_player: Player):
        if hit_player.is_alive() == False:
            return
        
        if hit_player.id == shoot_player.id:
            raise Exception("You can't hit yourself")
        
        if hit_player.get_team() == shoot_player.get_team():
            raise Exception("You can't hit your teammate")
        hit_player.take_hit(taken_dmg)
        if hit_player.is_alive():
            await self.send_hp_info(hit_player)
            return
            
        await self.send_elimininated_info(hit_player, shoot_player)
        lose_team = self.context.get_team_with_no_players_left()
        if lose_team is not None:
            print (f"Team {shoot_player.get_team()} wins the match")
            await self.context.transition_to_match_phase("waiting-for-players")
        
        
        
    async def send_hp_info(self, player: Player):
        await self.context.game_context.websockets.send_to_player(player.id, Message({"type": "hp_info", "data": {
            "hp": player.health_points
        }}))
        
    async def send_elimininated_info(self, player: Player, eliminated_by: Player):
        await self.context.game_context.websockets.send_to_all(Message({"type": "eliminated_info", "data": {
            "eliminated_by": eliminated_by.id,
            "eliminated_player": player.id
        }}))