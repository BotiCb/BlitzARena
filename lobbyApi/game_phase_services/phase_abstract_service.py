# phase_service.py
from abc import ABC, abstractmethod
from datetime import datetime

from game.game_context import GameContext


class PhaseAbstractService(ABC):

    def __init__(self, context: GameContext):
        self.context = context
        self._registered_handlers = []
    @abstractmethod
    def on_enter(self):
        """Called when the phase starts."""
        pass

    @abstractmethod
    def on_exit(self):
        """Called when the phase ends."""
        pass

    def _unregister_handlers(self):
        for handler_type in self._registered_handlers:
            self.context.websockets.unregister_handler(handler_type)
        self._registered_handlers.clear()
        
    @abstractmethod
    async def on_player_ready_to_phase(self, player_id):
        pass
