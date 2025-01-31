from dataclasses import dataclass
from models.player import Player

@dataclass
class PlayerInfoDto:
    player_id: str
    ready: bool
    is_host: bool
    is_connected: bool

    def __init__(self, player: Player):
        self.player_id = player.id
        self.ready = player.ready
        self.is_host = player.is_host
        self.is_connected = player.is_connected