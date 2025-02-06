import { SkPaint } from '@shopify/react-native-skia';
import { TensorflowPlugin } from 'react-native-fast-tflite';
import {
  DrawableFrame,
  DrawableFrameProcessor,
  ReadonlyFrameProcessor,
  runAtTargetFps,
  useFrameProcessor,
  useSkiaFrameProcessor,
} from 'react-native-vision-camera';
import { ISharedValue } from 'react-native-worklets-core';
import * as useResizePlugin from 'vision-camera-resize-plugin';

import { getHitBodyPartFromKeypoints } from './body-part-utils';
import { decodeYoloClassifyOutput, decodeYoloPoseOutput } from './yolo-output-decoders';

import { YOLO_POSE_CONSTANTS } from '~/utils/constants/detection-constants';
import {
  CAMERA_CONSTANTS,
  TRAINING_CAMERA_CONSTANTS,
} from '~/utils/constants/frame-processing-constans';
import { Classification, Detection, ObjectDetection } from '~/utils/types';


const { resize } = useResizePlugin.createResizePlugin();

export function drawDetections(frame: DrawableFrame, detection: ObjectDetection, paint: SkPaint) {
  'worklet';

  // Draw bounding box
  frame.drawLine(
    detection.boundingBox.x1 * frame.width,
    detection.boundingBox.y1 * frame.height,
    detection.boundingBox.x2 * frame.width,
    detection.boundingBox.y1 * frame.height,
    paint
  );
  frame.drawLine(
    detection.boundingBox.x2 * frame.width,
    detection.boundingBox.y1 * frame.height,
    detection.boundingBox.x2 * frame.width,
    detection.boundingBox.y2 * frame.height,
    paint
  );
  frame.drawLine(
    detection.boundingBox.x2 * frame.width,
    detection.boundingBox.y2 * frame.height,
    detection.boundingBox.x1 * frame.width,
    detection.boundingBox.y2 * frame.height,
    paint
  );
  frame.drawLine(
    detection.boundingBox.x1 * frame.width,
    detection.boundingBox.y2 * frame.height,
    detection.boundingBox.x1 * frame.width,
    detection.boundingBox.y1 * frame.height,
    paint
  );

  // Draw keypoints

  if (detection.keypoints) {
    for (const [startIdx, endIdx] of YOLO_POSE_CONSTANTS.BODY_CONNECTIONS) {
      const start = detection.keypoints[startIdx];
      const end = detection.keypoints[endIdx];

      if (start && end) {
        frame.drawLine(
          start.coord.x * frame.width,
          start.coord.y * frame.height,
          end.coord.x * frame.width,
          end.coord.y * frame.height,
          paint
        );
      }
    }
  }
}

export function trainingFrameProcessor(
  plugin: TensorflowPlugin,
  lastUpdateTime: ISharedValue<number>,
  detections: ISharedValue<ObjectDetection | null>,
  paint: SkPaint
): DrawableFrameProcessor {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useSkiaFrameProcessor(
    (frame) => {
      'worklet';
      frame.render();
      if (plugin.state === 'loaded') {
        runAtTargetFps(TRAINING_CAMERA_CONSTANTS.FPS, () => {
          'worklet';
          const resized = resize(frame, {
            scale: {
              width: plugin.model.inputs[0].shape[1],
              height: plugin.model.inputs[0].shape[2],
            },
            pixelFormat: 'rgb',
            rotation: '90deg',
            dataType: 'float32',
            crop: { x: 0, y: 0, width: frame.width, height: frame.height },
          });

          const outputs = plugin.model.runSync([resized]);

          const objDetection: ObjectDetection | null = decodeYoloPoseOutput(
            outputs,
            plugin.model.outputs[0].shape[2]
          );
          if (objDetection) {
            detections.value = objDetection;
            lastUpdateTime.value = Date.now();
          }
        });
      }

      const currentTime = Date.now();
      if (
        currentTime - lastUpdateTime.value >
        (1000 / TRAINING_CAMERA_CONSTANTS.FPS) *
          TRAINING_CAMERA_CONSTANTS.MAX_FRAMES_WITHOUT_DETECTION
      ) {
        detections.value = null;
      }
      if (detections.value) {
        drawDetections(frame, detections.value, paint);
      }
    },
    [plugin, detections]
  );
}
export function InBattleFrameProcessor(
  plugin: TensorflowPlugin,
  plugin2: TensorflowPlugin,
  lastUpdateTime: ISharedValue<number>,
  detections: ISharedValue<Detection | null>
): ReadonlyFrameProcessor {
  return useFrameProcessor(
    (frame) => {
      'worklet';
      // frame.render();

      if (plugin.state === 'loaded' && plugin2.state === 'loaded') {
        runAtTargetFps(CAMERA_CONSTANTS.FPS, () => {
          'worklet';
          const resized = resize(frame, {
            scale: {
              width: plugin.model.inputs[0].shape[1],
              height: plugin.model.inputs[0].shape[2],
            },
            pixelFormat: 'rgb',
            rotation: '90deg',
            dataType: 'float32',
            crop: { x: 0, y: 0, width: frame.width, height: frame.height },
          });

          const outputs = plugin.model.runSync([resized]);

          const objDetection: ObjectDetection | null = decodeYoloPoseOutput(
            outputs,
            plugin.model.outputs[0].shape[2]
          );
          outputs.length = 0;
          if (objDetection) {
            const cropData = {
              x: objDetection.boundingBox.x1 * frame.width,
              y: objDetection.boundingBox.y2 * frame.height,
              height: objDetection.boundingBox.w * frame.height,
              width: objDetection.boundingBox.h * frame.width,
            };
            const resized3 = resize(frame, {
              scale: {
                width: plugin2.model.inputs[0].shape[1],
                height: plugin2.model.inputs[0].shape[2],
              },
              pixelFormat: 'rgb',
              rotation: '90deg',
              dataType: 'float32',
              crop: cropData,
            });

            const outputs2 = plugin2.model.runSync([resized3]);
            const classification: Classification = decodeYoloClassifyOutput(outputs2[0]);

            outputs2.length = 0;

            if (objDetection) {
              detections.value = {
                objectDetection: objDetection,
                classification,
                bodyPart: getHitBodyPartFromKeypoints(objDetection.keypoints),
              };
            }
            lastUpdateTime.value = Date.now();
          }
        });
      }

      const currentTime = Date.now();
      if (
        currentTime - lastUpdateTime.value >
        (1000 / CAMERA_CONSTANTS.FPS) * CAMERA_CONSTANTS.MAX_FRAMES_WITHOUT_DETECTION
      ) {
        detections.value = null;
      }
    },
    [plugin, plugin2, detections]
  );
}
