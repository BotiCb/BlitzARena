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


class GameArea:
    def __init__(self, edges: List[Coordinates], team_bases: List[dict]):
        self.edges = edges
        self.team_bases = team_bases

    def to_dict(self):
        return {
            "edges": [edge.to_dict() for edge in self.edges],
            "team_bases": [
                {
                    "coordinates": base["coordinates"].to_dict(), 
                    "team": base["team"]
                } 
                for base in self.team_bases
            ]
        }