import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import { extname } from 'path';

@Injectable()
export class FileUploadService {
  constructor(private readonly firebaseService: FirebaseService) {}

  private async uploadFile(file: Express.Multer.File, folder, privateRead: boolean = false): Promise<string> {
    const storage = this.firebaseService.getStorageInstance();
    const bucket = storage.bucket();
    const extension = extname(file.originalname);
    const fileName = `${folder}/${Date.now()}${extension}`;
    const fileUpload = bucket.file(fileName);
    const privacy = privateRead ? 'private' : 'publicRead';
    const stream = fileUpload.createWriteStream({
      metadata: {
        contentType: file.mimetype,
      },
      predefinedAcl: privacy,
    });

    return new Promise((resolve, reject) => {
      stream.on('error', (error) => {
        reject(error);
      });
      stream.on('finish', () => {
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileUpload.name}`;
        resolve(publicUrl);
      });

      stream.end(file.buffer);
    });
  }

  async deleteFile(fileUrl: string) {
    try {
      const relativePath = fileUrl.replace('https://storage.googleapis.com/allamviz.appspot.com/', '');
      const storage = this.firebaseService.getStorageInstance();
      const bucket = storage.bucket();
      bucket.deleteFiles({
        prefix: relativePath,
      });
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  }

  async uploadProfilePicture(file: Express.Multer.File, oldPictureUrl?: string): Promise<string> {
    if (oldPictureUrl && oldPictureUrl !== '') {
      await this.deleteFile(oldPictureUrl);
    }
    const url = await this.uploadFile(file, 'profile-pictures');
    return url;
  }

  async uploadTfLiteModel(file: Express.Multer.File): Promise<string> {
    //throw an error if it is not a .tflite file

    
     const url = await this.uploadFile(file, 'tf-lite-models', true);
    return url;
  }
}
