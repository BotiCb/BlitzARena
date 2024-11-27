from ultralytics import YOLO

model = YOLO("models/yolov8n-pose.pt")

model.predict(source="0",
              show=True, save=True, show_labels=True)