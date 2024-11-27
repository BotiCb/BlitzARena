from ultralytics import YOLO

tflite_model = YOLO("models/yolov8n-pose_saved_model/yolov8n-pose_float32.tflite")

# Run inference
tflite_model("0", show=True, save=True, show_labels=True, imgsz=320)