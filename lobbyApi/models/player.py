from datetime import datetime


class Player:
    def __init__(self, player_id: str, is_host: bool = False):
        self.id = player_id
        self.is_ready = False
        self.is_host = is_host
        self.added_at =  datetime.utcnow()
        self.is_connected = False
        self.training_photo_count = 0

    def set_ready(self, ready: bool):
        """Set the ready status for the player."""
        self.is_ready = ready
    def set_host(self, is_host: bool):
        """Set the host status for the player."""
        self.is_host = is_host


    def increment_training_photo_count(self):
        self.training_photo_count += 1
        return self.training_photo_count

    def reset_training_photo_count(self):
        self.training_photo_count = 0

    def get_training_photo_count(self):
        return self.training_photo_count





