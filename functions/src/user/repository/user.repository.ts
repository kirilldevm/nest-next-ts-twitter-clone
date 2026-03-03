import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { User } from '../entity/user.entity';

interface UserDocumentData {
  email?: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string | null;
  createdAt?: admin.firestore.Timestamp | string | number;
}

@Injectable()
export class UserRepository {
  private usersDb = admin.firestore().collection('users');

  private mapDoc(doc: admin.firestore.DocumentSnapshot): User | null {
    if (!doc.exists) return null;
    const raw = doc.data();
    if (!raw) return null;

    const data = raw as UserDocumentData;
    const createdAt =
      data.createdAt &&
      typeof data.createdAt === 'object' &&
      'toDate' in data.createdAt
        ? data.createdAt.toDate()
        : new Date(data.createdAt as string | number);

    return {
      id: doc.id,
      email: data.email ?? '',
      firstName: data.firstName ?? '',
      lastName: data.lastName ?? '',
      profileImageUrl: data.profileImageUrl ?? null,
      createdAt,
    };
  }

  async getUser(id: string) {
    const user = await this.usersDb.doc(id).get();
    return this.mapDoc(user);
  }

  async createUser(id: string, data: UserDocumentData) {
    const docData = {
      ...data,
      // createdAt: admin.firestore.Timestamp.now(),
    };
    await this.usersDb.doc(id).set(docData);
  }
}
