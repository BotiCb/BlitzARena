import os
from typing import List, Dict


from game.game_context import GameContext
from game_phase_services.phase_abstract_service import PhaseAbstractService


from models.player import Player
from utils.dto_convention_converter import convert_dict_to_camel_case
from models.message import Message
import asyncio

from services.httpx_service import HTTPXService


class ModelTrainingPhaseService(PhaseAbstractService):

    def __init__(self, context: GameContext):
        super().__init__(context)
        self.max_photos_per_player = 20
        
        self.groups: Dict[int, List[str]] = {}
        self.httpx_service: HTTPXService = HTTPXService()


    def on_enter(self):
        self.context.websockets.register_handler("training_photo_sent", self.on_training_photo_sent)
        self._registered_handlers.extend(["training_photo_sent"])
        self.group_players()
        self.photo_count = 0
        self.training_data_collected = []
        for player in self.context.players:
            player.reset_training_photo_count()
        for group_id in self.groups:
            self.reset_players_training_photo_to_total_for_group(group_id, self.context.get_player(self.get_player_from_group_with_not_finished_training(group_id)))



    def on_exit(self):
        self._unregister_handlers()


    async def on_player_ready_to_phase(self, player_id: str):
        await self.send_group_to_player(player_id)

    async def on_training_photo_sent(self, player_id: str, message: dict):
        try:
            detected_player_id = message.get("detected_player")
            if detected_player_id in self.training_data_collected:
                await self.context.websockets.send_to_player(player_id,  Message({"type": "training_ready_for_player", "data": {
                        "player_ready": detected_player_id,
                    }}))
                await self.context.websockets.send_to_player(player_id, Message({"type": "next_training_player", "data": {
                        "next_player": self.get_player_from_group_with_not_finished_training(self.get_players_group_id(detected_player_id)),
                        "photos_to_collect": self.context.get_player(player_id).training_photo_left_to_take
                }}))
                return
                
            
            group_id = self.get_players_group_id(detected_player_id)
            detected_player= self.context.get_player(detected_player_id)
            player_photo_count = detected_player.increment_training_photo_count()

            print(f"Player {detected_player_id} has {player_photo_count} training photos")
            self.photo_count += 1

            photo_collecting_progresss = round(self.photo_count / (self.max_photos_per_player * len(self.context.players)) * 100)
            await self.context.websockets.send_to_all(
                Message({"type": "photo_collecting_progress", "data": {"progress": photo_collecting_progresss}})
            )
            self.context.get_player(player_id).training_photo_left_to_take -= 1

            if player_photo_count >= self.max_photos_per_player:
                await self.assign_next_player_for_training(group_id, detected_player)
                
        except KeyError as e:
            await self.context.websockets.send_error(player_id, f"Missing required key: {e}")


    async def start_training(self):
        try:
            body = convert_dict_to_camel_case({
                "num_classes": len(self.context.players),
                "num_images_per_class": self.max_photos_per_player,
            })
            print(body)
            response = await self.httpx_service.get_api_client().post(f"game/{self.context.get_game_id()}/model-training/start-training", json=body  )
            print("Model training started")
            await self.context.websockets.send_to_all(
                Message({"type": "training_started", "data": {}})
            )
            await self.context.transition_to_phase("game-room")
        except Exception as e:
            print(f"Error starting model training: {e}")


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
                
    async def send_group_to_player(self, player_id: str):
        photo_collecting_progresss = round(self.photo_count / (self.max_photos_per_player * len(self.context.players)) * 100)
        group_id = self.get_players_group_id(player_id)
        await self.context.websockets.send_to_player(
            player_id,
            Message({
                "type": "model_training_phase_info",
                "data": {
                    "group_members": self.groups[group_id],
                    "current_player": self.get_player_from_group_with_not_finished_training(group_id),
                    "photos_to_collect": self.context.get_player(player_id).training_photo_left_to_take,
                    "photo_collecting_progress": photo_collecting_progresss
                }
            })
        )


    def get_players_group_id(self, player_id: str):
        for group_id, player_ids in self.groups.items():
            if player_id in player_ids:
                return group_id


    def get_player_from_group_with_not_finished_training(self, group_id: int):
        for player_id in self.groups[group_id]:
            if player_id not in self.training_data_collected:
                return player_id
        return None
    
    async def assign_next_player_for_training(self, group_id: int, detected_player: Player):
        if detected_player.training_photo_count >= self.max_photos_per_player:
            self.training_data_collected.append(detected_player.id)
            print(f"Training data collected for player {detected_player.id}, {len(self.training_data_collected)}/{len(self.context.players)} players collected")
        else : 
            print(f"Training skipped for player {detected_player.id}")
        await self.context.websockets.send_to_group(self.groups[group_id],
                    Message({"type": "training_ready_for_player", "data": {
                        "player_ready": detected_player.id,
                    }}))
        next_player = self.get_player_from_group_with_not_finished_training(group_id)
        print(f"Next player: {next_player}")
        if next_player:
            self.reset_players_training_photo_to_total_for_group(group_id, self.context.get_player(next_player))
            await self.context.websockets.send_to_group(self.groups[group_id],
                Message({"type": "next_training_player", "data": {
                "next_player": next_player,
                "photos_to_collect": (self.max_photos_per_player- self.context.get_player(next_player).training_photo_count)/(len(self.groups[group_id])-1),
            }}))
        else:
            print("All players finished training frpm group")
            await self.context.websockets.send_to_group(self.groups[group_id],
                Message({"type": "training_finished_for_group", "data": {}}))
        if len(self.context.players) == len(self.training_data_collected):
            await self.start_training()
            
            
    def reset_players_training_photo_to_total_for_group(self, group_id: int, traninee: Player):
        for player_id in self.groups[group_id]:
                player = self.context.get_player(player_id)
                if player.id == traninee.id:
                    player.training_photo_left_to_take = 0
                    continue
                player.training_photo_left_to_take = (self.max_photos_per_player-traninee.training_photo_count)/(len(self.groups[group_id])-1)
            
