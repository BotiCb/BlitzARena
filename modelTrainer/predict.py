from ultralytics import YOLO

model = YOLO("models/person320n.pt")

model.predict(source="0",
              show=True, save=True, show_labels=True, conf=0.5)