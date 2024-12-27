from ultralytics import YOLO

model = YOLO("models/cls.pt")

model.predict(source="0",
              show=True, save=True, show_labels=True)