import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import type { FirestoreTransaction } from 'src/types/firestore.type';
import { ReactionTargetType, ReactionType } from '../entity/reaction.entity';

function docId(
  targetType: ReactionTargetType,
  targetId: string,
  userId: string,
) {
  return `${targetType}_${targetId}_${userId}`;
}

@Injectable()
export class ReactionRepository {
  private reactionsDb = admin.firestore().collection('reactions');

  async getReaction(
    targetType: ReactionTargetType,
    targetId: string,
    userId: string,
    transaction?: FirestoreTransaction,
  ): Promise<{ type: ReactionType } | null> {
    const id = docId(targetType, targetId, userId);
    const docRef = this.reactionsDb.doc(id);
    const doc = transaction
      ? await transaction.get(docRef)
      : await docRef.get();

    if (!doc.exists) return null;

    const data = doc.data();
    if (!data?.type) return null;

    return { type: data.type as ReactionType };
  }

  async setReaction(
    targetType: ReactionTargetType,
    targetId: string,
    userId: string,
    type: ReactionType,
    transaction?: FirestoreTransaction,
  ): Promise<void> {
    const id = docId(targetType, targetId, userId);
    const docRef = this.reactionsDb.doc(id);
    const data = {
      targetType,
      targetId,
      userId,
      type,
      createdAt: new Date(),
    };

    if (transaction) {
      transaction.set(docRef, data);
    } else {
      await docRef.set(data);
    }
  }

  async deleteReaction(
    targetType: ReactionTargetType,
    targetId: string,
    userId: string,
    transaction?: FirestoreTransaction,
  ): Promise<void> {
    const id = docId(targetType, targetId, userId);
    const docRef = this.reactionsDb.doc(id);

    if (transaction) {
      transaction.delete(docRef);
    } else {
      await docRef.delete();
    }
  }
}
