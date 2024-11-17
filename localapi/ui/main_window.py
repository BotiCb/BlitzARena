import sys
from PyQt5.QtWidgets import QApplication, QMainWindow, QLabel, QPushButton, QVBoxLayout, QWidget


class MainWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("My First PyQt5 App")

        # Layout and Widgets
        layout = QVBoxLayout()
        label = QLabel("Hello, PyQt5!")
        button = QPushButton("Click Me")

        # Add to layout
        layout.addWidget(label)
        layout.addWidget(button)

        # Set central widget
        central_widget = QWidget()
        central_widget.setLayout(layout)
        self.setCentralWidget(central_widget)


