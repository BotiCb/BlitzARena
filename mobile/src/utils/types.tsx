import * as Posenet from "@tensorflow-models/posenet";
import { exp } from "@tensorflow/tfjs";
export type SceletonProps = {
    model: SceletonModel,
    isModelLoaded: boolean
}

export type SceletonModel = {
    baseModel: Posenet.PoseNet | null,
}

export interface InbattleScreenProps {
    sceletonModel: SceletonModel | null;
    isModelLoaded: boolean;
  }

  export interface TensorCameraViewProps {
    sceletonModel: SceletonModel | null;
    isModelLoaded: boolean;
  }