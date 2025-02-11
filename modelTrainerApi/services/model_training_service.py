from ultralytics import YOLO

class ModelTrainingService:
    def __init__(self):
        self.dataset_dir = "dataset"

    def train(self, game_id:str):


        model = YOLO("yolo11n-cls.pt")

        model.train(data=f"{self.dataset_dir}/{game_id}",
                    imgsz=320, rect=True, epochs=20, batch=50, patience=3, workers=0, device=0, amp=True)

        model.export(format="tflite", batch=1, imgsz=320, rect=True)