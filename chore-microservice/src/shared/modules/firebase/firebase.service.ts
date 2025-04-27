import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { config } from 'src/shared/config/config';

@Injectable()
export class FirebaseService {
  private storage: admin.storage.Storage;

  constructor() {
    const serviceAccount: admin.ServiceAccount = {
      projectId: config.get('firebase.service_account.project_id'),
      privateKey: config.get('firebase.service_account.private_key').replace(/\\n/g, '\n'),
      clientEmail: config.get('firebase.service_account.client_email'),
    };
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: 'blitz-arena-3fcca.firebasestorage.app',
    });

    this.storage = admin.storage();
  }

  getStorageInstance(): admin.storage.Storage {
    return this.storage;
  }
}
