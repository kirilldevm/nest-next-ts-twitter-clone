import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as admin from 'firebase-admin';
import { FirestoreTransaction } from 'src/types';
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

  async deleteUser(id: string, transaction?: FirestoreTransaction) {
    const docRef = this.usersDb.doc(id);
    if (transaction) {
      transaction.delete(docRef);
    } else {
      await docRef.delete();
    }
  }

  async updateUser(
    id: string,
    data: Partial<User>,
    transaction?: FirestoreTransaction,
  ): Promise<void> {
    const docRef = this.usersDb.doc(id);
    const doc = transaction
      ? await transaction.get(docRef)
      : await docRef.get();

    if (!doc.exists) {
      throw new NotFoundException('User not found');
    }

    if (data.email) {
      const emailQuery = this.usersDb.where('email', '==', data.email);
      const existingSnapshot = transaction
        ? await transaction.get(emailQuery)
        : await emailQuery.get();

      if (
        existingSnapshot.docs.length > 0 &&
        existingSnapshot.docs[0].id !== id
      ) {
        throw new BadRequestException('Email is already in use');
      }
    }
    if (data.email && !doc.data()?.emailVerified) {
      throw new BadRequestException('Email is not verified');
    }

    const { id: _id, ...update } = data as Partial<User> & { id?: string };
    void _id; // exclude id from Firestore update
    if (Object.keys(update).length > 0) {
      if (transaction) {
        transaction.update(docRef, update);
      } else {
        await doc.ref.update(update);
      }
    }
  }
}
