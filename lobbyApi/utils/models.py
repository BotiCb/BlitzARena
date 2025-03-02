from typing import List

class Coordinates:
    def __init__(self, longitude: float, latitude: float):
        self.longitude = longitude
        self.latitude = latitude

    def to_dict(self):
        return {
            "longitude": self.longitude,
            "latitude": self.latitude
        }

class TeamBase:
    def __init__(self, coordinates: Coordinates, team: str):
        self.coordinates = coordinates
        self.team = team

    def to_dict(self):
        return {
            "coordinates": self.coordinates.to_dict(),
            "team": self.team
        }

class GameArea:
    def __init__(self, edges: List[Coordinates], team_bases: List[TeamBase]):
        self.edges = edges
        self.team_bases = team_bases

    def to_dict(self):
        return {
            "edges": [edge.to_dict() for edge in self.edges],
            "team_bases": [base.to_dict() for base in self.team_bases]
        }