import { useEffect, useState } from "react";
import { Platform } from "react-native";
import { loadTensorflowModel, TensorflowModel } from "react-native-fast-tflite";
import { useSharedValue } from "react-native-worklets-core";

import { useGame } from "~/contexts/GameContext";
import { Player } from "~/utils/models";
import { BODY_PART, Detection } from "~/utils/types/detection-types";

export const useDetections = () => {
  const [classifyModel, setClassifyModel] = useState<TensorflowModel | null>(null);
  const [poseModel, setPoseModel] = useState<TensorflowModel | null>(null);
  const { model, players } = useGame();
  const [detectedPerson, setDetectedPerson] = useState<{ player: Player, bodyPart: BODY_PART, confidence: number } | null>(null);
  const delegate = Platform.OS === "ios" ? "core-ml" : undefined;
  const detections = useSharedValue<Detection | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      if (detections.value) {
        const player: Player | null =
          players.find(
            (player) =>
              player.sessionID ===
              model?.mapperArray[detections.value?.classification.id ?? 0],
          ) || null;
        console.log("player", player?.firstName, Math.round(detections.value.classification.confidenceAdvantage * 100), detections.value.bodyPart);
        if (!player) {
          return;
        }

        setDetectedPerson({ player, bodyPart: detections.value.bodyPart, confidence: Math.round(detections.value.classification.confidenceAdvantage * 100) });
      } else {
        setDetectedPerson(null);
      }
    }, 200);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (model?.path) {
      console.log("Loading model:", model.path);
      loadTensorflowModel(
        { url: `file://${model.path}` },
        delegate,
      ).then((model) => {
        setClassifyModel(model);
      });
    }
  }, [model]);


  useEffect(() => {
    loadTensorflowModel(
      require(`../../assets/models/yolo11n-pose_integer_quant.tflite`),
      delegate,
    ).then((model) => {
      setPoseModel(model);
    });

  }, []);

  return {
    classifyModel,
    poseModel,
    detections,
    detectedPerson,
  };
};
