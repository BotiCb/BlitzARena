import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseService {
  private storage: admin.storage.Storage;

  constructor() {
    //eslint-disable-next-line @typescript-eslint/no-var-requires
    const serviceAccount = require('../../../../firebase-service-account.json');

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
