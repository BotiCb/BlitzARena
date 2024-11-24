from ultralytics import YOLO


model = YOLO("C:/Allamvizsga/allamvizsgaProjekt/modelTrainer/models/yolo11n.pt")
model.train(data="dataset_custom.yaml", imgsz = 300, epochs = 50, batch = 8, workers = 0, device = 0)