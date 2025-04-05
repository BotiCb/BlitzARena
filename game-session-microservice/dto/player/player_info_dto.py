from dataclasses import dataclass
from models.player import Player

@dataclass
class PlayerInfoDto:
    player_id: str
    is_host: bool
    is_connected: bool
    team: str
    kills: int = 0
    deaths: int = 0

    def __init__(self, player: Player):
        self.player_id = player.id
        self.is_host = player.is_host
        self.is_connected = player.is_connected
        self.team = player.team
        self.kills = player.kills
        self.deaths = player.deaths