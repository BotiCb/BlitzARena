from datetime import datetime

class Coordinates:
    def __init__(self, longitude: float, latitude: float):
        self.longitude = longitude
        self.latitude = latitude
        
class Player:
    def __init__(self, player_id: str, is_host: bool = False):
        self.id = player_id
        self.is_ready = False
        self.is_host = is_host
        self.added_at =  datetime.utcnow()
        self.is_connected = False
        self.training_photo_count = 0
        self.team = None
        self.coordinates = None

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
    
    def get_team(self):
        return self.team
    
    def set_team(self, team: str):
        self.team=team
        
    def get_coordinates(self):
        return self.coordinates
    
    def set_coordinates(self, coordinates: Coordinates):
        self.coordinates=coordinates







