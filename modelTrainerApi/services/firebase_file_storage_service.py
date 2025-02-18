import firebase_admin
from firebase_admin import credentials, storage
import os

class FirebaseStorageService:
    _instance = None
    
    def __new__(cls, *args, **kwargs):
        if not cls._instance:
            cls._instance = super(FirebaseStorageService, cls).__new__(cls)
        return cls._instance

    def __init__(self):
        if not firebase_admin._apps:
            cred = credentials.Certificate('firebase-service-account.json')
            firebase_admin.initialize_app(cred, {
                'storageBucket': "blitz-arena-3fcca.appspot.com"
            })

    def upload_file(self, file_path: str, destination_path: str, make_public: bool = True) -> str:

        if not os.path.exists(file_path):
            raise FileNotFoundError(f"File '{file_path}' does not exist.")

        bucket = storage.bucket()


        blob = bucket.blob(destination_path)

        blob.upload_from_filename(file_path)

        if make_public:
            blob.make_public()

        return blob.public_url