import { LatLng } from 'react-native-maps';

import { Player } from './models';

export const isMe = (player: Player | null, sessionId: string) => {
  return player && player.sessionID === sessionId;
};

// Helper function to check if point is inside polygon using ray-casting algorithm
function isPointInPolygon(point: LatLng, polygon: LatLng[]): boolean {
  const x = point.longitude;
  const y = point.latitude;
  let inside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].longitude;
    const yi = polygon[i].latitude;
    const xj = polygon[j].longitude;
    const yj = polygon[j].latitude;

    const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;

    if (intersect) inside = !inside;
  }
  return inside;
}

// Helper function to check if two line segments intersect
function segmentsIntersect(a1: LatLng, a2: LatLng, b1: LatLng, b2: LatLng): boolean {
  const ccw = (p1: LatLng, p2: LatLng, p3: LatLng): number => {
    return (
      (p2.longitude - p1.longitude) * (p3.latitude - p1.latitude) -
      (p2.latitude - p1.latitude) * (p3.longitude - p1.longitude)
    );
  };

  return ccw(a1, a2, b1) * ccw(a1, a2, b2) < 0 && ccw(b1, b2, a1) * ccw(b1, b2, a2) < 0;
}

// Main validation function
export function isAreaValid(userLocation: LatLng, corners: LatLng[]): boolean {
  // Check if polygon has at least 3 points
  if (corners.length < 3) return false;

  // 1. Check if user location is inside the polygon
  const containsUser = isPointInPolygon(userLocation, corners);
  if (!containsUser) return false;

  // 2. Check for self-intersections
  const n = corners.length;
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const a1 = corners[i];
      const a2 = corners[(i + 1) % n];
      const b1 = corners[j];
      const b2 = corners[(j + 1) % n];

      // Skip adjacent edges
      if (j === (i + 1) % n || i === (j + 1) % n) continue;

      if (segmentsIntersect(a1, a2, b1, b2)) {
        return false;
      }
    }
  }

  return true;
}
