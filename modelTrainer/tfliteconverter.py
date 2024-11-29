from ultralytics import YOLO

model= YOLO("models/yolo11n-seg.pt")

model.export(format="tflite", batch=1, half=True, imgsz=320, int8=True
             )