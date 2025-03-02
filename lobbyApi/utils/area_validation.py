
from typing import List
from utils.models import Coordinates, GameArea
from math import radians, sin, cos, sqrt, atan2


def validate_area(player_coords: Coordinates, game_area: GameArea) -> bool:
    """
    Validates the game area and player position.
    Returns False if:
    - The polygon edges self-intersect.
    - Any team base is outside the polygon.
    - Player's coordinates are outside the polygon.
    """
    edges = game_area.edges
    if _has_self_intersection(edges):
        return False
    
    for team_base in game_area.team_bases:
        tb_coords = team_base.coordinates 
        if not _is_point_in_polygon(tb_coords, edges):
            return False
    
    if not _is_point_in_polygon(player_coords, edges):
        return False
    
    return True

def _has_self_intersection(vertices: List[Coordinates]) -> bool:
    n = len(vertices)
    if n < 3:
        return False  # Not a polygon
    
    segments = [(vertices[i], vertices[(i+1)%n]) for i in range(n)]
    
    for i in range(n):
        a1, a2 = segments[i]
        for j in range(i+1, n):
            b1, b2 = segments[j]
            # Skip consecutive edges
            if j == (i + 1) % n or i == (j + 1) % n:
                continue
            if _segments_intersect(a1, a2, b1, b2):
                return True
    return False

def _segments_intersect(a1: Coordinates, a2: Coordinates, b1: Coordinates, b2: Coordinates) -> bool:
    o1 = _orientation(a1, a2, b1)
    o2 = _orientation(a1, a2, b2)
    o3 = _orientation(b1, b2, a1)
    o4 = _orientation(b1, b2, a2)
    
    # General case: segments intersect
    if o1 != o2 and o3 != o4:
        return True
    
    # Special cases: colinear and on segment
    if o1 == 0 and _on_segment(a1, b1, a2):
        return True
    if o2 == 0 and _on_segment(a1, b2, a2):
        return True
    if o3 == 0 and _on_segment(b1, a1, b2):
        return True
    if o4 == 0 and _on_segment(b1, a2, b2):
        return True
    
    return False

def _orientation(p: Coordinates, q: Coordinates, r: Coordinates) -> int:
    val = (q.latitude - p.latitude) * (r.longitude - q.longitude) - (q.longitude - p.longitude) * (r.latitude - q.latitude)
    if val == 0:
        return 0  # Colinear
    return 1 if val > 0 else 2  # Clockwise or counter-clockwise

def _on_segment(p: Coordinates, q: Coordinates, r: Coordinates) -> bool:
    return (min(p.longitude, r.longitude) <= q.longitude <= max(p.longitude, r.longitude)) and \
           (min(p.latitude, r.latitude) <= q.latitude <= max(p.latitude, r.latitude))

def _is_point_in_polygon(point: Coordinates, polygon: List[Coordinates]) -> bool:
    n = len(polygon)
    if n < 3:
        return False
    
    inside = False
    x, y = point.longitude, point.latitude
    
    for i in range(n):
        p1 = polygon[i]
        p2 = polygon[(i+1)%n]
        
        # Check if point is on the edge
        if _is_point_on_segment(point, p1, p2):
            return True  # Consider edge as inside
        
        # Ray casting algorithm
        if (p1.latitude > y) != (p2.latitude > y):
            x_inters = (y - p1.latitude) * (p2.longitude - p1.longitude) / (p2.latitude - p1.latitude + 1e-9) + p1.longitude
            if x <= x_inters:
                inside = not inside
    
    return inside

def _is_point_on_segment(p: Coordinates, a: Coordinates, b: Coordinates) -> bool:
    if _orientation(a, b, p) != 0:
        return False
    return _on_segment(a, p, b)


def are_coordinates_within_distance(coord1: Coordinates, coord2: Coordinates, distance: float) -> bool:
    """
    Returns True if the two coordinates are closer than the given distance (in meters), otherwise False.
    """
    R = 6371000  # Radius of Earth in meters

    # Convert latitude and longitude from degrees to radians
    lat1, lon1 = radians(coord1.latitude), radians(coord1.longitude)
    lat2, lon2 = radians(coord2.latitude), radians(coord2.longitude)

    # Differences
    dlat = lat2 - lat1
    dlon = lon2 - lon1

    # Haversine formula
    a = sin(dlat / 2)**2 + cos(lat1) * cos(lat2) * sin(dlon / 2)**2
    c = 2 * atan2(sqrt(a), sqrt(1 - a))
    distance_between = R * c  # Distance in meters
    print (f"Distance between {coord1} and {coord2}: {distance_between} meters")
    return distance_between < distance



