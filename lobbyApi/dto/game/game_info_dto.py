from typing import List

from dto.player.player_info_dto import PlayerInfoDto
from models.game_instance import GameInstance


class GameInfoDto:
    game_id: str
    max_players: int
    players: List[PlayerInfoDto]

    def __init__(self, game:GameInstance):
        self.game_id = game.game_id
        self.max_players = game.max_players
        self.players = [PlayerInfoDto(player) for player in game.players]