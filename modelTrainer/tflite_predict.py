from ultralytics import YOLO

tflite_model = YOLO("./models/best_saved_model/best_float32.tflite", task="classify")

tflite_model("0", show=True, save=True, show_labels=True, imgsz=(192,320), task="classify")