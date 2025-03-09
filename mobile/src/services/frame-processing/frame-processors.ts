import { SkPaint } from '@shopify/react-native-skia';
import { TensorflowModel, TensorflowPlugin } from 'react-native-fast-tflite';
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
import { BODY_PART, Classification, Detection, ObjectDetection } from '~/utils/types/detection-types';

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
  model: TensorflowModel,
  lastUpdateTime: ISharedValue<number>,
  detections: ISharedValue<ObjectDetection | null>,
  paint: SkPaint
): ReadonlyFrameProcessor {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useFrameProcessor(
    (frame) => {
      'worklet';
      //frame.render();

      runAtTargetFps(5, () => {
        'worklet';
        const resized = resize(frame, {
          scale: {
            width: model.inputs[0].shape[1],
            height: model.inputs[0].shape[2],
          },
          pixelFormat: 'rgb',
          rotation: '90deg',
          dataType: 'float32',
          crop: { x: 0, y: 0, width: frame.width, height: frame.height },
        });
        const start = Date.now();
        const outputs = model.runSync([resized]);
        //console.log('Inference time: ', Date.now() - start);
        const objDetection: ObjectDetection | null = decodeYoloPoseOutput(
          outputs,
          model.outputs[0].shape[2]
        );
        if (objDetection) {
          detections.value = objDetection;
          lastUpdateTime.value = Date.now();
        }
      });


      const currentTime = Date.now();
      if (
        currentTime - lastUpdateTime.value >
        (1000 / TRAINING_CAMERA_CONSTANTS.FPS) *
        TRAINING_CAMERA_CONSTANTS.MAX_FRAMES_WITHOUT_DETECTION
      ) {
        detections.value = null;
      }
      if (detections.value) {
        //drawDetections(frame, detections.value, paint);
      }
    },
    [model, detections]
  );
}
export function InBattleSkiaFrameProcessor(
  model: TensorflowModel,
  model2: TensorflowModel,
  lastUpdateTime: ISharedValue<number>,
  detections: ISharedValue<Detection | null>,
  paint: SkPaint
): DrawableFrameProcessor {
  return useSkiaFrameProcessor(
    (frame) => {
      'worklet';
      frame.render();


      runAtTargetFps(15, () => {
        'worklet';
        const resized = resize(frame, {
          scale: {
            width: model.inputs[0].shape[1],
            height: model.inputs[0].shape[2],
          },
          pixelFormat: 'rgb',
          rotation: '90deg',
          dataType: 'float32',
          crop: { x: 0, y: 0, width: frame.width, height: frame.height },
        });
        const start = Date.now();
        try {
        const outputs = model.runSync([resized]);
        
        //console.log('pose time: ', Date.now() - start);
        const objDetection: ObjectDetection | null = decodeYoloPoseOutput(
          outputs,
          model.outputs[0].shape[2]
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
              width: model2.inputs[0].shape[1],
              height: model2.inputs[0].shape[2],
            },
            pixelFormat: 'rgb',
            rotation: '90deg',
            dataType: 'float32',
            crop: cropData,
          });

          const start = Date.now();
          const outputs2 = model2.runSync([resized3]);
          //console.log('class time: ', Date.now() - start);
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
      } catch (e) {
        console.error(e);
      }
      });


      const currentTime = Date.now();
      if (
        currentTime - lastUpdateTime.value >
        (1000 / CAMERA_CONSTANTS.FPS) * CAMERA_CONSTANTS.MAX_FRAMES_WITHOUT_DETECTION
      ) {
        detections.value = null;
      }
      if (detections.value) {
        drawDetections(frame, detections.value.objectDetection, paint);
      }
    },
    [detections]
  );
}



export function InBattleFrameProcessor(
  model: TensorflowModel,
  model2: TensorflowModel,
  lastUpdateTime: ISharedValue<number>,
  detections: ISharedValue<Detection | null>,
  paint: SkPaint
): ReadonlyFrameProcessor {
  return useFrameProcessor(
    (frame) => {
      'worklet';
      


      runAtTargetFps(detections.value ? 5 : 3, () => {
        'worklet';
        const resized = resize(frame, {
          scale: {
            width: model.inputs[0].shape[1],
            height: model.inputs[0].shape[2],
          },
          pixelFormat: 'rgb',
          rotation: '90deg',
          dataType: 'float32',
          crop: { x: 0, y: 0, width: frame.width, height: frame.height },
        });
        const start = performance.now();
        const outputs = model.runSync([resized]);
        
        //console.log('pose time: ', performance.now() - start);
        const objDetection: ObjectDetection | null = decodeYoloPoseOutput(
          outputs,
          model.outputs[0].shape[2]
        );
        outputs.length = 0;
        if (!objDetection) {
          return;
        }
        const bodyPart = getHitBodyPartFromKeypoints(objDetection.keypoints);
        if (objDetection) {
          const cropData = {
            x: objDetection.boundingBox.x1 * frame.width,
            y: objDetection.boundingBox.y2 * frame.height,
            height: objDetection.boundingBox.w * frame.height,
            width: objDetection.boundingBox.h * frame.width,
          };
          const resized3 = resize(frame, {
            scale: {
              width: model2.inputs[0].shape[1],
              height: model2.inputs[0].shape[2],
            },
            pixelFormat: 'rgb',
            rotation: '90deg',
            dataType: 'float32',
            crop: cropData,
          });

          const start = performance.now();
          const outputs2 = model2.runSync([resized3]);
          //console.log('class time: ', performance.now() - start);
          const classification: Classification = decodeYoloClassifyOutput(outputs2[0]);

          outputs2.length = 0;

          if (objDetection) {
            detections.value = {
              objectDetection: objDetection,
              classification,
              bodyPart,
            };
          }
          lastUpdateTime.value = Date.now();
        }
      });


      const currentTime = Date.now();
      if (
        currentTime - lastUpdateTime.value >
        (1000 / CAMERA_CONSTANTS.FPS) * CAMERA_CONSTANTS.MAX_FRAMES_WITHOUT_DETECTION
      ) {
        detections.value = null;
      }
    },
    [detections]
  );
}
