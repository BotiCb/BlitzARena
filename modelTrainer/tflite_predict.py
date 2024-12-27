from ultralytics import YOLO

tflite_model = YOLO("models/cls_saved_model/cls_integer_quant.tflite")

tflite_model("0", show=True, save=True, show_labels=True, imgsz=320, task="classify")