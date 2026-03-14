import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { FirestoreTransaction } from 'src/types';
import { Comment } from '../entity/comment.entity';

const LIMIT_MAX = 50;
const LIMIT_DEFAULT = 20;

@Injectable()
export class CommentRepository {
  private commentsDb = admin.firestore().collection('comments');

  private mapDoc(doc: admin.firestore.DocumentSnapshot): Comment | null {
    if (!doc.exists) return null;
    const data = doc.data() as Comment;
    if (!data) return null;

    const toDate = (v: unknown): Date => {
      if (v instanceof Date) return v;
      if (v && typeof v === 'object' && 'toDate' in v) {
        return (v as admin.firestore.Timestamp).toDate();
      }
      return new Date((v as string | number) || Date.now());
    };

    return {
      id: doc.id,
      postId: data.postId,
      authorId: data.authorId,
      authorDisplayName: data.authorDisplayName,
      authorPhotoURL: data.authorPhotoURL ?? null,
      content: data.content,
      parentId: data.parentId ?? null,
      replyCount: data.replyCount ?? 0,
      likesCount: data.likesCount ?? 0,
      dislikesCount: data.dislikesCount ?? 0,
      isDeleted: data.isDeleted ?? false,
      createdAt: toDate(data.createdAt),
      updatedAt: toDate(data.updatedAt),
    };
  }

  async getComment(
    id: string,
    transaction?: FirestoreTransaction,
  ): Promise<Comment | null> {
    const docRef = this.commentsDb.doc(id);
    const doc = transaction
      ? await transaction.get(docRef)
      : await docRef.get();
    return this.mapDoc(doc);
  }

  async createComment(
    data: Omit<Comment, 'id'>,
    transaction?: FirestoreTransaction,
  ): Promise<Comment> {
    const docRef = this.commentsDb.doc();
    const now = new Date();
    const comment: Record<string, unknown> = {
      ...data,
      id: docRef.id,
      createdAt: data.createdAt ?? now,
      updatedAt: data.updatedAt ?? now,
    };

    if (transaction) {
      transaction.set(docRef, comment);

      return this.mapDoc({
        id: docRef.id,
        exists: true,
        data: () => comment,
      } as admin.firestore.DocumentSnapshot) as Comment;
    }

    await docRef.set(comment);
    const created = await this.getComment(docRef.id);
    if (!created) throw new Error('Failed to create comment');
    return created;
  }

  async updateComment(
    id: string,
    data: Partial<
      Pick<
        Comment,
        'content' | 'isDeleted' | 'likesCount' | 'dislikesCount' | 'replyCount'
      >
    >,
    transaction?: FirestoreTransaction,
  ): Promise<void> {
    const docRef = this.commentsDb.doc(id);
    const update: Record<string, unknown> = {
      ...data,
      updatedAt: new Date(),
    };
    delete update.id;
    delete update.authorId;
    delete update.postId;
    delete update.parentId;
    delete update.createdAt;
    delete update.authorDisplayName;
    delete update.authorPhotoURL;

    const filtered = Object.fromEntries(
      Object.entries(update).filter(([, v]) => v !== undefined),
    ) as Record<string, FieldValue | undefined>;

    if (Object.keys(filtered).length > 0) {
      if (transaction) {
        transaction.update(docRef, filtered);
      } else {
        const doc = await docRef.get();

        if (!doc.exists) return;

        await docRef.update(filtered);
      }
    }
  }

  async deleteComment(
    id: string,
    transaction?: FirestoreTransaction,
  ): Promise<void> {
    const docRef = this.commentsDb.doc(id);
    if (transaction) {
      transaction.delete(docRef);
    } else {
      await docRef.delete();
    }
  }

  async listComments(options: {
    postId: string;
    parentId: string | null;
    limit?: number;
    cursor?: string;
  }): Promise<{ items: Comment[]; nextCursor: string | null }> {
    const limit = Math.min(options.limit ?? LIMIT_DEFAULT, LIMIT_MAX);

    let query: admin.firestore.Query = this.commentsDb
      .where('postId', '==', options.postId)
      .where('parentId', '==', options.parentId)
      .orderBy('createdAt', 'asc');

    if (options.cursor) {
      const cursorDoc = await this.commentsDb.doc(options.cursor).get();
      if (cursorDoc.exists) {
        query = query.startAfter(cursorDoc);
      }
    }

    query = query.limit(limit + 1);
    const snapshot = await query.get();
    const items = snapshot.docs
      .slice(0, limit)
      .map((d) => this.mapDoc(d))
      .filter((c): c is Comment => c !== null);
    const hasMore = snapshot.docs.length > limit;
    const nextCursor = hasMore ? snapshot.docs[limit - 1].id : null;

    return { items, nextCursor };
  }
}
