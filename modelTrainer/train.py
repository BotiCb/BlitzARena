from ultralytics import YOLO


model = YOLO("C:/Allamvizsga/allamvizsgaProjekt/modelTrainer/models/yolo11n-cls.pt")
model.train(data="C:/Allamvizsga/allamvizsgaProjekt/modelTrainer/training_dataset", imgsz = 320, epochs = 20, batch = 80, workers = 0, device = 0)