# phase_service.py
from abc import ABC, abstractmethod


class PhaseService(ABC):
    @abstractmethod
    def on_enter(self):
        """Called when the phase starts."""
        pass

    @abstractmethod
    def on_exit(self):
        """Called when the phase ends."""
        pass
