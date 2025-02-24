# lobby_service.py
from game.game_context import GameContext
from game_phase_services.phase_service import PhaseService
from models.message import Message


class GameRoomService(PhaseService):
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