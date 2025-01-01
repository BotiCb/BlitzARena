from ultralytics import YOLO

model= YOLO("./models/best.pt" , task="classify")

model.export(format="tflite", batch=1, imgsz=320)