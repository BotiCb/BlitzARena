from PyQt5.QtWidgets import QMainWindow, QVBoxLayout, QPushButton, QLabel, QWidget
from ui.photo_uploader import PhotoUploader


class MainWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("TensorFlow Trainer")

        # Layout and Widgets
        layout = QVBoxLayout()
        self.label = QLabel("Main Application")
        self.open_uploader_button = QPushButton("Open Photo Uploader")

        # Add to layout
        layout.addWidget(self.label)
        layout.addWidget(self.open_uploader_button)

        # Set central widget
        central_widget = QWidget()
        central_widget.setLayout(layout)
        self.setCentralWidget(central_widget)

        # Events
        self.open_uploader_button.clicked.connect(self.open_photo_uploader)

    def open_photo_uploader(self):
        # Open the PhotoUploader widget
        self.uploader_window = PhotoUploader()
        self.uploader_window.show()
