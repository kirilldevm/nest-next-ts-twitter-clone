import { BadRequestException, Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { FirestoreTransaction } from 'src/types';
import { Post } from '../entity/post.entity';

const LIMIT_MAX = 50;
const LIMIT_DEFAULT = 10;

@Injectable()
export class PostRepository {
  private postsDb = admin.firestore().collection('posts');

  private mapDoc(doc: admin.firestore.DocumentSnapshot): Post | null {
    if (!doc.exists) return null;

    const data = doc.data() as Post;

    if (!data) return null;

    return {
      id: doc.id,
      authorId: data.authorId,
      title: data.title,
      text: data.text,
      photoURL: data.photoURL ?? null,
      createdAt:
        data.createdAt &&
        typeof data.createdAt === 'object' &&
        'toDate' in data.createdAt
          ? (data.createdAt as unknown as admin.firestore.Timestamp).toDate()
          : new Date(data.createdAt as unknown as string | number),
      likesCount: data.likesCount ?? 0,
      dislikesCount: data.dislikesCount ?? 0,
      commentsCount: data.commentsCount ?? 0,
    };
  }

  async getPost(
    id: string,
    transaction?: FirestoreTransaction,
  ): Promise<Post | null> {
    const docRef = this.postsDb.doc(id);

    const doc = transaction
      ? await transaction.get(docRef)
      : await docRef.get();

    return this.mapDoc(doc);
  }

  async createPost(data: Omit<Post, 'id'>): Promise<Post> {
    const docRef = this.postsDb.doc();
    const post: Omit<Post, 'id'> & { id?: string } = {
      ...data,
      createdAt: data.createdAt ?? new Date(),
    };

    await docRef.set({ ...post, id: docRef.id });

    const created = await this.getPost(docRef.id);

    if (!created) throw new BadRequestException('Failed to create post');

    return created;
  }

  async updatePost(
    id: string,
    data: Partial<Post>,
    transaction?: FirestoreTransaction,
  ): Promise<Post | null> {
    const docRef = this.postsDb.doc(id);

    /* eslint-disable @typescript-eslint/no-unused-vars */
    const {
      id: _id,
      authorId: _authorId,
      createdAt: _createdAt,
      ...update
    } = data;

    if (Object.keys(update).length > 0) {
      if (transaction) {
        transaction.update(docRef, update);
      } else {
        const doc = await docRef.get();

        if (!doc.exists) return null;

        await docRef.update(update);
      }
    }

    if (transaction) return null;

    return this.getPost(id);
  }

  async incrementPostCounts(
    id: string,
    deltas: {
      likesDelta?: number;
      dislikesDelta?: number;
      commentsDelta?: number;
    },
    transaction?: FirestoreTransaction,
  ): Promise<void> {
    const docRef = this.postsDb.doc(id);
    const update: Record<string, FieldValue> = {};

    if (deltas.likesDelta !== undefined)
      update.likesCount = FieldValue.increment(deltas.likesDelta);

    if (deltas.dislikesDelta !== undefined)
      update.dislikesCount = FieldValue.increment(deltas.dislikesDelta);

    if (deltas.commentsDelta !== undefined)
      update.commentsCount = FieldValue.increment(deltas.commentsDelta);

    if (Object.keys(update).length === 0) return;

    if (transaction) {
      transaction.update(docRef, update);
    } else {
      await docRef.update(update);
    }
  }

  async deletePost(
    id: string,
    transaction?: FirestoreTransaction,
  ): Promise<void> {
    const docRef = this.postsDb.doc(id);

    if (transaction) {
      transaction.delete(docRef);
    } else {
      await docRef.delete();
    }
  }

  async listPostIdsByAuthorId(
    authorId: string,
    transaction?: FirestoreTransaction,
  ): Promise<string[]> {
    const query = this.postsDb.where('authorId', '==', authorId).limit(500);
    const snapshot = transaction
      ? await transaction.get(query)
      : await query.get();

    return snapshot.docs.map((d) => d.id);
  }

  async listPosts(options: {
    authorId?: string;
    limit?: number;
    cursor?: string;
    sortBy?: 'createdAt' | 'engagement';
  }): Promise<{ items: Post[]; nextCursor: string | null }> {
    const limit = Math.min(options.limit ?? LIMIT_DEFAULT, LIMIT_MAX);
    const sortBy = options.sortBy ?? 'engagement';

    let query: admin.firestore.Query;
    if (options.authorId) {
      query = this.postsDb
        .where('authorId', '==', options.authorId)
        .orderBy('createdAt', 'desc');
    } else if (sortBy === 'engagement') {
      query = this.postsDb
        .orderBy('likesCount', 'desc')
        .orderBy('commentsCount', 'desc')
        .orderBy('createdAt', 'desc');
    } else {
      query = this.postsDb.orderBy('createdAt', 'desc');
    }

    if (options.cursor) {
      const cursorDoc = await this.postsDb.doc(options.cursor).get();
      if (cursorDoc.exists) {
        query = query.startAfter(cursorDoc);
      }
    }

    query = query.limit(limit + 1);
    const snapshot = await query.get();
    const items = snapshot.docs
      .slice(0, limit)
      .map((d) => this.mapDoc(d))
      .filter((p): p is Post => p !== null);

    const hasMore = snapshot.docs.length > limit;
    const nextCursor = hasMore ? snapshot.docs[limit - 1].id : null;

    return { items, nextCursor };
  }

  /**
   * Simple text search fallback for dev/emulator when Algolia isn't available.
   * Fetches posts and filters by title/text containing the query (case-insensitive).
   * Not suitable for production with large datasets.
   */
  async searchPostsByText(
    query: string,
    options?: { limit?: number; page?: number },
  ): Promise<{ items: Post[]; nextPage: number | null; totalHits: number }> {
    const limit = Math.min(options?.limit ?? 50, 100);
    const page = Math.max(0, options?.page ?? 0);

    const snapshot = await this.postsDb
      .orderBy('createdAt', 'desc')
      .limit(200)
      .get();

    const items = snapshot.docs
      .map((d) => this.mapDoc(d))
      .filter((p): p is Post => p !== null);

    const lower = query.toLowerCase().trim();
    const filtered = items.filter((p) => {
      const inTitle = (p.title ?? '').toLowerCase().includes(lower);
      const inText = (p.text ?? '').toLowerCase().includes(lower);
      return inTitle || inText;
    });

    const totalHits = filtered.length;
    const start = page * limit;
    const pageItems = filtered.slice(start, start + limit);
    const nextPage = start + limit < totalHits ? page + 1 : null;

    return { items: pageItems, nextPage, totalHits };
  }
}
