import os
import shutil
from PyQt5.QtWidgets import (QVBoxLayout, QLabel, QPushButton,
                             QFileDialog, QLineEdit, QWidget, QMessageBox)


class PhotoUploader(QWidget):
    def __init__(self, parent=None):
        super().__init__(parent)
        self.setWindowTitle("Photo Uploader")

        # Layout and Widgets
        layout = QVBoxLayout()

        self.class_name_label = QLabel("Enter Class Name:")
        self.class_name_input = QLineEdit()

        self.upload_button = QPushButton("Upload Photos")
        self.clear_button = QPushButton("Clear Uploaded Photos")
        self.label = QLabel("Upload photos for the class.")

        # Add to layout
        layout.addWidget(self.class_name_label)
        layout.addWidget(self.class_name_input)
        layout.addWidget(self.upload_button)
        layout.addWidget(self.clear_button)
        layout.addWidget(self.label)

        # Set layout
        self.setLayout(layout)

        # Event handling
        self.upload_button.clicked.connect(self.upload_photos)
        self.clear_button.clicked.connect(self.clear_uploaded_photos)

    def upload_photos(self):
        class_name = self.class_name_input.text()

        if not class_name:
            self.show_message("Error", "Please enter a valid class name.")
            return

        # Open file dialog to select photos
        options = QFileDialog.Options()
        files, _ = QFileDialog.getOpenFileNames(self, "Select Photos", "", "Images (*.png *.xpm *.jpg *.jpeg)",
                                                options=options)
        if not files:
            self.show_message("Error", "No photos selected.")
            return

        # Select target directory (class folder)
        target_dir = os.path.join("tensorflow/photos", class_name)
        if not os.path.exists(target_dir):
            os.makedirs(target_dir)

        # Copy selected files to the target folder
        for file in files:
            shutil.copy(file, target_dir)

        # Show status in the label
        self.label.setText(f"Uploaded {len(files)} photos for class: {class_name}")

        # Ask if the user wants to add more classes
        self.ask_add_more_classes()

    def clear_uploaded_photos(self):
        class_name = self.class_name_input.text()

        if not class_name:
            self.show_message("Error", "Please enter a class name to clear.")
            return

        target_dir = os.path.join("tensorflow/photos", class_name)

        if not os.path.exists(target_dir) or not os.listdir(target_dir):
            self.show_message("Error", "No photos found for this class.")
            return

        # Clear the class folder by removing all files
        for file in os.listdir(target_dir):
            file_path = os.path.join(target_dir, file)
            if os.path.isfile(file_path):
                os.remove(file_path)
        os.removedirs(target_dir)
        self.label.setText(f"All photos for class '{class_name}' have been cleared.")
        self.show_message("Success", f"All photos for class '{class_name}' have been deleted.")

    def ask_add_more_classes(self):
        # Show a confirmation dialog
        reply = QMessageBox.question(self, 'Add More Classes',
                                     "Do you want to add another class?",
                                     QMessageBox.Yes | QMessageBox.No, QMessageBox.Yes)

        if reply == QMessageBox.Yes:
            self.class_name_input.clear()  # Clear the input field for a new class name
            self.label.setText("Enter Class Name and Upload Photos.")
        else:
            self.label.setText("Upload complete. All photos have been added.")
            self.upload_button.setEnabled(False)  # Disable further uploads
            self.class_name_input.setEnabled(False)  # Disable class name input
            # Optionally, you can provide a button to finish or start training
            self.show_message("Finished", "You can now proceed with model training.")

    def show_message(self, title, message):
        msg = QMessageBox()
        msg.setIcon(QMessageBox.Information)
        msg.setWindowTitle(title)
        msg.setText(message)
        msg.exec_()
