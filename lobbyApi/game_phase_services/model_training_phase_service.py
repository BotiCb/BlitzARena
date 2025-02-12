import os
from typing import List, Dict

from game.game_context import GameContext
from game_phase_services.phase_service import PhaseService

from models.message import Message
import asyncio

class ModelTrainingPhaseService(PhaseService):

    def __init__(self, context: GameContext):
        super().__init__(context)
        self.max_photos_per_player = 30
        self.photo_count = 0
        self.training_data_collected = []
        self.groups: Dict[int, List[str]] = {}


    def on_enter(self):
        self.context.websockets.register_handler("training_photo_sent", self.on_training_photo_sent)
        self.group_players()
        asyncio.create_task(self.send_groups())



    def on_exit(self):
        self._unregister_handlers()

    async def on_training_photo_sent(self, player_id: str, message: dict):
        try:
            detected_player = message.get("detected_player")
            group_id = self.get_players_group_id(detected_player)
            if detected_player in self.training_data_collected:
                asyncio.create_task( self.context.websockets.send_to_group(self.groups[group_id],
                    Message({"type": "training_ready_for_player", "data": {
                        "player_ready": detected_player,
                    }})))
                next_player = self.get_player_from_group_with_not_finished_training(group_id)
                if next_player:
                    asyncio.create_task( self.context.websockets.send_to_group(self.groups[group_id],
                        Message({"type": "next_training_player", "data": {
                        "next_player": next_player
                    }})))
                else:
                    asyncio.create_task( self.context.websockets.send_to_all(
                        Message({"type": "training_finished_for_group", "data": {}})))
                return

            player_photo_count = self.context.get_player(detected_player).increment_training_photo_count()

            print(f"Player {detected_player} has {player_photo_count} training photos")
            self.photo_count += 1

            training_progress = round(self.photo_count / (self.max_photos_per_player * len(self.context.players)) * 100)
            asyncio.create_task( self.context.websockets.send_to_all(
                Message({"type": "training_progress", "data": {"progress": training_progress}})
            ))

            if player_photo_count >= self.max_photos_per_player:
                asyncio.create_task( self.context.websockets.send_to_all(
                    Message({"type": "training_ready_for_player", "data": detected_player})))
                self.training_data_collected.append(detected_player)
                print(
                    f"Training data collected for player {detected_player}, {len(self.training_data_collected)}/{len(self.context.players)} players collected")

        except KeyError as e:
            asyncio.create_task( self.context.websockets.send_error(player_id, f"Missing required key: {e}"))

    async def start_training(self):
        asyncio.create_task( self.context.websockets.send_to_all(
            Message({"type": "training_started", "data": {}})))


    def group_players(self) -> None:
        total_players = len(self.context.players)
        # if total_players < 2:
        #     raise ValueError("At least 2 players are required to form groups.")

        remainder = total_players % 3

        if remainder == 0:
            group_sizes = [3] * (total_players // 3)
        elif remainder == 1:
            num_3_groups = (total_players - 4) // 3
            if num_3_groups >= 0:
                group_sizes = [3] * num_3_groups + [2, 2]
            else:
                group_sizes = [2, 2]
        else:  # remainder == 2
            group_sizes = [3] * (total_players // 3) + [2]

        current_index = 0
        self.groups = {}
        for group_id, size in enumerate(group_sizes):
            group_members = self.context.players[current_index: current_index + size]
            player_ids = [player.id for player in group_members]
            self.groups[group_id] = player_ids
            current_index += size

    async def send_groups(self):
        for group_id, player_ids in self.groups.items():
            if player_ids:
                asyncio.create_task( self.context.websockets.send_to_group(
                    player_ids,
                    Message({
                        "type": "group_assigned",
                        "data": {
                            "group_members": player_ids,
                            "first_player": player_ids[0]
                        }
                    })
                ))


    def get_players_group_id(self, player_id: str):
        for group_id, player_ids in self.groups.items():
            if player_id in player_ids:
                return group_id


    def get_player_from_group_with_not_finished_training(self, group_id: int):
        for player_id in self.groups[group_id]:
            if player_id not in self.training_data_collected:
                return player_id
        return None