from ultralytics import YOLO

model = YOLO("models/yolo11n-pose.pt")

model.predict(source="0",
              show=True, save=True, show_labels=True)