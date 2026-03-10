import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseService implements OnModuleInit {
  private app: admin.app.App;

  constructor(private config: ConfigService) {}

  onModuleInit() {
    this.app = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: this.config.get<string>('FIREBASE_PROJECT_ID'),
        clientEmail: this.config.get<string>('FIREBASE_CLIENT_EMAIL'),
        privateKey: (this.config
          .get<string>('FIREBASE_PRIVATE_KEY') || '')
          .replace(/\\n/g, '\n'), // fix newlines in .env
      }),
    });
  }

  getAuth(): admin.auth.Auth {
    return this.app.auth();
  }
}