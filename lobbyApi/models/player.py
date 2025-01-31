from datetime import datetime


class Player:
    def __init__(self, player_id: str, is_host: bool = False):
        self.id = player_id
        self.ready = False
        self.is_host = is_host
        self.added_at =  datetime.utcnow()
        self.is_connected = False

    def set_ready(self, ready: bool):
        """Set the ready status for the player."""
        self.ready = ready
    def set_host(self, is_host: bool):
        """Set the host status for the player."""
        self.is_host = is_host


