from ultralytics import YOLO

model = YOLO("models/csongor_boti_alpar.pt")

model.predict(source="0",
              show=True, save=True, show_labels=True)