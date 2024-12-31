from ultralytics import YOLO


model = YOLO("C:/Allamvizsga/allamvizsgaProjekt/modelTrainer/models/yolo11n-cls.pt")

model.train(data="C:/Allamvizsga/allamvizsgaProjekt/modelTrainer/training_dataset",
            imgsz = 480, rect= True, epochs = 20, batch = 50, patience = 3, workers = 0, device = 0 , amp =True)

model.export(format="tflite", batch=1, imgsz=[320,192], rect= True)