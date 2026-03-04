import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { User } from '../entity/user.entity';

@Injectable()
export class UserRepository {
  private usersDb = admin.firestore().collection('users');

  private mapDoc(doc: admin.firestore.DocumentSnapshot): User | null {
    if (!doc.exists) return null;
    const data = doc.data();
    if (!data) return null;

    return {
      id: doc.id,
      ...data,
      createdAt:
        data.createdAt &&
        typeof data.createdAt === 'object' &&
        'toDate' in data.createdAt
          ? (data.createdAt as admin.firestore.Timestamp).toDate()
          : new Date(data.createdAt as string | number),
    } as User;
  }

  async getUser(id: string) {
    const user = await this.usersDb.doc(id).get();
    return this.mapDoc(user);
  }

  async createUser(data: User) {
    await this.usersDb.doc(data.id).set(data);
  }

  async deleteUser(id: string) {
    await this.usersDb.doc(id).delete();
  }
}
