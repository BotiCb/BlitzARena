from ultralytics import YOLO

tflite_model = YOLO("models/person320n_saved_model/person320n_full_integer_quant.tflite")

tflite_model("0", show=True, save=True, show_labels=True, imgsz=320, task="detect")