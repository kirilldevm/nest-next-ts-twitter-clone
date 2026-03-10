import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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

  async getUser(id: string): Promise<User | null> {
    const user = await this.usersDb.doc(id).get();
    return this.mapDoc(user);
  }

  async createUser(data: User): Promise<User | null> {
    await this.usersDb.doc(data.id).set(data);
    return this.getUser(data.id);
  }

  async deleteUser(id: string) {
    await this.usersDb.doc(id).delete();
  }

  async updateUser(id: string, data: Partial<User>): Promise<void> {
    const docRef = this.usersDb.doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      throw new NotFoundException('User not found');
    }

    if (data.email) {
      const existingUser = await this.usersDb
        .where('email', '==', data.email)
        .get();
      if (existingUser.docs.length > 0 && existingUser.docs[0].id !== id) {
        throw new BadRequestException('Email is already in use');
      }
    }
    if (data.email && !doc.data()?.emailVerified) {
      throw new BadRequestException('Email is not verified');
    }
    await doc.ref.update(data);
  }
}
