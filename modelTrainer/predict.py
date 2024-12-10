from ultralytics import YOLO

model = YOLO("models/csongor_boti_alpar_v2.pt")

model.predict(source="0",
              show=True, save=True, show_labels=True)