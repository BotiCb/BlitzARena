from ultralytics import YOLO

model= YOLO("./models/best.pt")

model.export(format="tflite", batch=1, half=True, imgsz=480)