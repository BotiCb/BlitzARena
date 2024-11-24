from ultralytics import YOLO

model= YOLO("models/person320n.pt")

model.export(format="tflite", int8=True)