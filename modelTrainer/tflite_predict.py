from ultralytics import YOLO

tflite_model = YOLO("models/yolo11n-pose_saved_model/yolo11n-pose_float32.tflite")

tflite_model("0", show=True, save=True, show_labels=True, imgsz=320)