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
        """Start battle phase with 3-minute timer in the background"""
        time_delta = timedelta(seconds=10)
        self.ends_at = datetime.now() + time_delta
        # Start non-blocking countdown
        self._countdown_task = asyncio.create_task(self._run_countdown(time_delta))

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