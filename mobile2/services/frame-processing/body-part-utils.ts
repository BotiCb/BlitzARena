import { BODY_PART_DETECTIONS_CONSTANTS } from "@/utils/constants/detection-constants";
import { Keypoints, KEYPOINTS, BODY_PART } from "../../utils/types/detection-types";
import { Point } from "../../utils/types/detection-types";
function distance(p1: Point, p2: Point): number {
  "worklet";
  return Math.sqrt((p1.x - p2.x) * (p1.x - p2.x) + (p1.y - p2.y) * (p1.y - p2.y));
}

export function isPointInRectangle(rectPoints: Point[], fixedPoint: Point): boolean {
  "worklet";

  const crossProduct = (v1: Point, v2: Point): number => {
    return v1.x * v2.y - v1.y * v2.x;
  };

  const n = rectPoints.length;
  let prevSign: boolean | null = null;

  for (let i = 0; i < n; i++) {
    const current = rectPoints[i];
    const next = rectPoints[(i + 1) % n];

    const edgeVector: Point = { x: next.x - current.x, y: next.y - current.y };
    const pointVector: Point = {
      x: fixedPoint.x - current.x,
      y: fixedPoint.y - current.y,
    };

    const cp = crossProduct(pointVector, edgeVector);

    const currentSign = cp > 0;
    if (prevSign === null) {
      prevSign = currentSign;
    } else if (prevSign !== currentSign) {
      return false;
    }
  }

  return true;
}

function distanceFromPointToSegment(A: Point, B: Point, P: Point): number {
  "worklet";
  // Vectors from A to B and from A to P
  const ABx = B.x - A.x;
  const ABy = B.y - A.y;
  const APx = P.x - A.x;
  const APy = P.y - A.y;

  // Squared length of the segment AB
  const ABLengthSquared = ABx * ABx + ABy * ABy;

  // Dot product of vectors AP and AB
  const dotProduct = APx * ABx + APy * ABy;
  // Projection factor t of point P onto the line defined by points A and B
  const t = dotProduct / ABLengthSquared;

  // If the projection falls outside the segment (t < 0 or t > 1),
  // we calculate the distance to the closest endpoint (A or B)
  if (t < 0) {
    // The projection is closer to point A
    return Math.sqrt(APx * APx + APy * APy);
  } else if (t > 1) {
    // The projection is closer to point B
    const BPx = P.x - B.x;
    const BPy = P.y - B.y;
    return Math.sqrt(BPx * BPx + BPy * BPy);
  } else {
    // The projection is within the segment, so we calculate the perpendicular distance
    const dist = Math.abs(ABx * APy - ABy * APx) / Math.sqrt(ABLengthSquared);
    return dist;
  }
}

function isChestHit(keypoints: Keypoints): boolean {
  "worklet";
  if (
    keypoints[KEYPOINTS.LEFT_SHOULDER] &&
    keypoints[KEYPOINTS.RIGHT_SHOULDER] &&
    keypoints[KEYPOINTS.LEFT_HIP] &&
    keypoints[KEYPOINTS.RIGHT_HIP]
  ) {
    const chestCoordinates = [
      keypoints[KEYPOINTS.LEFT_SHOULDER].coord,
      keypoints[KEYPOINTS.RIGHT_SHOULDER].coord,
      keypoints[KEYPOINTS.RIGHT_HIP].coord,
      keypoints[KEYPOINTS.LEFT_HIP].coord,
    ];

    if (isPointInRectangle(chestCoordinates, BODY_PART_DETECTIONS_CONSTANTS.CENTER_POINT)) {
      return true;
    }
  }

  let distanceFromTheLeftPart = Infinity;
  if (keypoints[KEYPOINTS.LEFT_SHOULDER]?.coord && keypoints[KEYPOINTS.LEFT_HIP]?.coord) {
    distanceFromTheLeftPart = distanceFromPointToSegment(
      keypoints[KEYPOINTS.LEFT_SHOULDER].coord,
      keypoints[KEYPOINTS.LEFT_HIP].coord,
      BODY_PART_DETECTIONS_CONSTANTS.CENTER_POINT,
    );
  }

  const isLeftPartHit =
    distanceFromTheLeftPart <
    (keypoints[KEYPOINTS.LEFT_SHOULDER]?.coord && keypoints[KEYPOINTS.LEFT_HIP]?.coord
      ? distance(keypoints[KEYPOINTS.LEFT_SHOULDER].coord, keypoints[KEYPOINTS.LEFT_HIP].coord) * BODY_PART_DETECTIONS_CONSTANTS.CHEST_SIDES_PADDING
      : Infinity);

  let distanceFromTheRightPart = Infinity;
  if (keypoints[KEYPOINTS.RIGHT_SHOULDER]?.coord && keypoints[KEYPOINTS.RIGHT_HIP]?.coord) {
    distanceFromTheRightPart = distanceFromPointToSegment(
      keypoints[KEYPOINTS.RIGHT_SHOULDER].coord,
      keypoints[KEYPOINTS.RIGHT_HIP].coord,
      BODY_PART_DETECTIONS_CONSTANTS.CENTER_POINT,
    );
  }

  const isRightPartHit =
    distanceFromTheRightPart <
    (keypoints[KEYPOINTS.RIGHT_SHOULDER]?.coord && keypoints[KEYPOINTS.RIGHT_HIP]?.coord
      ? distance(keypoints[KEYPOINTS.RIGHT_SHOULDER].coord, keypoints[KEYPOINTS.RIGHT_HIP].coord) * BODY_PART_DETECTIONS_CONSTANTS.CHEST_SIDES_PADDING
      : Infinity);

  let distanceFromTheTopPart = Infinity;
  if (keypoints[KEYPOINTS.LEFT_SHOULDER]?.coord && keypoints[KEYPOINTS.RIGHT_SHOULDER]?.coord) {
    distanceFromTheTopPart = distanceFromPointToSegment(
      keypoints[KEYPOINTS.LEFT_SHOULDER].coord,
      keypoints[KEYPOINTS.RIGHT_SHOULDER].coord,
      BODY_PART_DETECTIONS_CONSTANTS.CENTER_POINT,
    );
  }

  const isTopPartHit =
    distanceFromTheTopPart <
    (keypoints[KEYPOINTS.LEFT_SHOULDER]?.coord && keypoints[KEYPOINTS.RIGHT_SHOULDER]?.coord
      ? distance(keypoints[KEYPOINTS.LEFT_SHOULDER].coord, keypoints[KEYPOINTS.RIGHT_SHOULDER].coord) * BODY_PART_DETECTIONS_CONSTANTS.CHEST_TOP_PADDING
      : Infinity);

  return isLeftPartHit || isRightPartHit || isTopPartHit;
}

function isLegHit(keypoints: Keypoints): boolean {
  "worklet";

  let distanceFromLeftUpperLeg = Infinity;
  if (keypoints[KEYPOINTS.LEFT_HIP]?.coord && keypoints[KEYPOINTS.LEFT_KNEE]?.coord) {
    distanceFromLeftUpperLeg = distanceFromPointToSegment(
      keypoints[KEYPOINTS.LEFT_HIP].coord,
      keypoints[KEYPOINTS.LEFT_KNEE].coord,
      BODY_PART_DETECTIONS_CONSTANTS.CENTER_POINT,
    );
  }

  const isLeftUpperLegHit =
    distanceFromLeftUpperLeg <
    (keypoints[KEYPOINTS.LEFT_HIP]?.coord && keypoints[KEYPOINTS.LEFT_KNEE]?.coord
      ? distance(keypoints[KEYPOINTS.LEFT_HIP].coord, keypoints[KEYPOINTS.LEFT_KNEE].coord) * BODY_PART_DETECTIONS_CONSTANTS.UPPER_LEG_PADDING
      : Infinity);

  let distanceFromRightUpperLeg = Infinity;
  if (keypoints[KEYPOINTS.RIGHT_HIP]?.coord && keypoints[KEYPOINTS.RIGHT_KNEE]?.coord) {
    distanceFromRightUpperLeg = distanceFromPointToSegment(
      keypoints[KEYPOINTS.RIGHT_HIP].coord,
      keypoints[KEYPOINTS.RIGHT_KNEE].coord,
      BODY_PART_DETECTIONS_CONSTANTS.CENTER_POINT,
    );
  }

  const isRightUpperLegHit =
    distanceFromRightUpperLeg <
    (keypoints[KEYPOINTS.RIGHT_HIP]?.coord && keypoints[KEYPOINTS.RIGHT_KNEE]?.coord
      ? distance(keypoints[KEYPOINTS.RIGHT_HIP].coord, keypoints[KEYPOINTS.RIGHT_KNEE].coord) * BODY_PART_DETECTIONS_CONSTANTS.UPPER_LEG_PADDING
      : Infinity);

  let distanceFromLeftLowerLeg = Infinity;
  if (keypoints[KEYPOINTS.LEFT_KNEE]?.coord && keypoints[KEYPOINTS.LEFT_ANKLE]?.coord) {
    distanceFromLeftLowerLeg = distanceFromPointToSegment(
      keypoints[KEYPOINTS.LEFT_KNEE].coord,
      keypoints[KEYPOINTS.LEFT_ANKLE].coord,
      BODY_PART_DETECTIONS_CONSTANTS.CENTER_POINT,
    );
  }

  const isLeftLowerLegHit =
    distanceFromLeftLowerLeg <
    (keypoints[KEYPOINTS.LEFT_KNEE]?.coord && keypoints[KEYPOINTS.LEFT_ANKLE]?.coord
      ? distance(keypoints[KEYPOINTS.LEFT_KNEE].coord, keypoints[KEYPOINTS.LEFT_ANKLE].coord) * BODY_PART_DETECTIONS_CONSTANTS.LOWER_LEG_PADDING
      : Infinity);

  let distanceFromRightLowerLeg = Infinity;
  if (keypoints[KEYPOINTS.RIGHT_KNEE]?.coord && keypoints[KEYPOINTS.RIGHT_ANKLE]?.coord) {
    distanceFromRightLowerLeg = distanceFromPointToSegment(
      keypoints[KEYPOINTS.RIGHT_KNEE].coord,
      keypoints[KEYPOINTS.RIGHT_ANKLE].coord,
      BODY_PART_DETECTIONS_CONSTANTS.CENTER_POINT,
    );
  }

  const isRightLowerLegHit =
    distanceFromRightLowerLeg <
    (keypoints[KEYPOINTS.RIGHT_KNEE]?.coord && keypoints[KEYPOINTS.RIGHT_ANKLE]?.coord
      ? distance(keypoints[KEYPOINTS.RIGHT_KNEE].coord, keypoints[KEYPOINTS.RIGHT_ANKLE].coord) * BODY_PART_DETECTIONS_CONSTANTS.LOWER_LEG_PADDING
      : Infinity);

  if (isLeftUpperLegHit || isRightUpperLegHit || isLeftLowerLegHit || isRightLowerLegHit) {
    return true;
  }

  return false;
}

function isHandHit(keypoints: Keypoints): boolean {
  "worklet";

  let distanceFromLeftUpperArm = Infinity;
  if (keypoints[KEYPOINTS.LEFT_SHOULDER]?.coord && keypoints[KEYPOINTS.LEFT_ELBOW]?.coord) {
    distanceFromLeftUpperArm = distanceFromPointToSegment(
      keypoints[KEYPOINTS.LEFT_SHOULDER].coord,
      keypoints[KEYPOINTS.LEFT_ELBOW].coord,
      BODY_PART_DETECTIONS_CONSTANTS.CENTER_POINT,
    );
  }

  const isLeftUpperArmHit =
    distanceFromLeftUpperArm <
    (keypoints[KEYPOINTS.LEFT_SHOULDER]?.coord && keypoints[KEYPOINTS.LEFT_ELBOW]?.coord
      ? distance(keypoints[KEYPOINTS.LEFT_SHOULDER].coord, keypoints[KEYPOINTS.LEFT_ELBOW].coord) * BODY_PART_DETECTIONS_CONSTANTS.UPPER_ARM_PADDING
      : Infinity);

  let distanceFromRightUpperArm = Infinity;
  if (keypoints[KEYPOINTS.RIGHT_SHOULDER]?.coord && keypoints[KEYPOINTS.RIGHT_ELBOW]?.coord) {
    distanceFromRightUpperArm = distanceFromPointToSegment(
      keypoints[KEYPOINTS.RIGHT_SHOULDER].coord,
      keypoints[KEYPOINTS.RIGHT_ELBOW].coord,
      BODY_PART_DETECTIONS_CONSTANTS.CENTER_POINT,
    );
  }

  const isRightUpperArmHit =
    distanceFromRightUpperArm <
    (keypoints[KEYPOINTS.RIGHT_SHOULDER]?.coord && keypoints[KEYPOINTS.RIGHT_ELBOW]?.coord
      ? distance(keypoints[KEYPOINTS.RIGHT_SHOULDER].coord, keypoints[KEYPOINTS.RIGHT_ELBOW].coord) * BODY_PART_DETECTIONS_CONSTANTS.UPPER_ARM_PADDING
      : Infinity);

  let distanceFromLeftLowerArm = Infinity;
  if (keypoints[KEYPOINTS.LEFT_ELBOW]?.coord && keypoints[KEYPOINTS.LEFT_WRIST]?.coord) {
    distanceFromLeftLowerArm = distanceFromPointToSegment(
      keypoints[KEYPOINTS.LEFT_ELBOW].coord,
      keypoints[KEYPOINTS.LEFT_WRIST].coord,
      BODY_PART_DETECTIONS_CONSTANTS.CENTER_POINT,
    );
  }

  const isLeftLowerArmHit =
    distanceFromLeftLowerArm <
    (keypoints[KEYPOINTS.LEFT_ELBOW]?.coord && keypoints[KEYPOINTS.LEFT_WRIST]?.coord
      ? distance(keypoints[KEYPOINTS.LEFT_ELBOW].coord, keypoints[KEYPOINTS.LEFT_WRIST].coord) * BODY_PART_DETECTIONS_CONSTANTS.LOWER_ARM_PADDING
      : Infinity);

  let distanceFromRightLowerArm = Infinity;
  if (keypoints[KEYPOINTS.RIGHT_ELBOW]?.coord && keypoints[KEYPOINTS.RIGHT_WRIST]?.coord) {
    distanceFromRightLowerArm = distanceFromPointToSegment(
      keypoints[KEYPOINTS.RIGHT_ELBOW].coord,
      keypoints[KEYPOINTS.RIGHT_WRIST].coord,
      BODY_PART_DETECTIONS_CONSTANTS.CENTER_POINT,
    );
  }

  const isRightLowerArmHit =
    distanceFromRightLowerArm <
    (keypoints[KEYPOINTS.RIGHT_ELBOW]?.coord && keypoints[KEYPOINTS.RIGHT_WRIST]?.coord
      ? distance(keypoints[KEYPOINTS.RIGHT_ELBOW].coord, keypoints[KEYPOINTS.RIGHT_WRIST].coord) * BODY_PART_DETECTIONS_CONSTANTS.LOWER_ARM_PADDING
      : Infinity);

  if (isLeftUpperArmHit || isRightUpperArmHit || isLeftLowerArmHit || isRightLowerArmHit) {
    return true;
  }

  return false;
}

function isHeadHit(keypoints: Keypoints): boolean {
  "worklet";

  if (keypoints[KEYPOINTS.NOSE]?.coord && keypoints[KEYPOINTS.LEFT_SHOULDER]?.coord) {
    const noseToShoulderDistance = distance(keypoints[KEYPOINTS.NOSE].coord, keypoints[KEYPOINTS.LEFT_SHOULDER].coord);
    const headSize = noseToShoulderDistance;
    const isHeadHit = distance(keypoints[KEYPOINTS.NOSE].coord, BODY_PART_DETECTIONS_CONSTANTS.CENTER_POINT) < headSize;
    return isHeadHit;
  }

  return false;
}

export function getHitBodyPartFromKeypoints(
  keypoints: Keypoints | null,
  scopeCoordinates: Point = BODY_PART_DETECTIONS_CONSTANTS.CENTER_POINT,
): BODY_PART {
  "worklet";

  if (scopeCoordinates.x < 0 || scopeCoordinates.y < 0 || scopeCoordinates.x > 1 || scopeCoordinates.y > 1) {
    throw new Error("Invalid scope coordinates");
  }

  if (keypoints === null || Object.keys(keypoints).length === 0) {
    return BODY_PART.NOTHING;
  }

  if (isLegHit(keypoints)) {
    return BODY_PART.LEG;
  }

  if (isHandHit(keypoints)) {
    return BODY_PART.ARM;
  }

  if (isHeadHit(keypoints)) {
    return BODY_PART.HEAD;
  }
  if (isChestHit(keypoints)) {
    return BODY_PART.CHEST;
  }

  return BODY_PART.NOTHING;
}
