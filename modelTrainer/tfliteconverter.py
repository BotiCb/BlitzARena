from ultralytics import YOLO

model= YOLO("models/yolov8n-pose.pt")

model.export(format="tflite", batch=1, half=True, imgsz=320, int8=True
             )