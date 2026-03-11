import { BadRequestException, Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { Post } from '../entity/post.entity';

const LIMIT_MAX = 50;
const LIMIT_DEFAULT = 10;

@Injectable()
export class PostRepository {
  private postsDb = admin.firestore().collection('posts');

  private mapDoc(doc: admin.firestore.DocumentSnapshot): Post | null {
    if (!doc.exists) return null;
    const data = doc.data();
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
          ? (data.createdAt as admin.firestore.Timestamp).toDate()
          : new Date(data.createdAt as string | number),
    } as Post;
  }

  async getPost(id: string): Promise<Post | null> {
    const doc = await this.postsDb.doc(id).get();
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

  async updatePost(id: string, data: Partial<Post>): Promise<Post | null> {
    const docRef = this.postsDb.doc(id);
    const doc = await docRef.get();

    if (!doc.exists) return null;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const {
      id: _id,
      authorId: _authorId,
      createdAt: _createdAt,
      ...update
    } = data;

    if (Object.keys(update).length > 0) {
      await docRef.update(update);
    }

    return this.getPost(id);
  }

  async deletePost(id: string): Promise<void> {
    await this.postsDb.doc(id).delete();
  }

  async listPosts(options: {
    authorId?: string;
    limit?: number;
    cursor?: string;
  }): Promise<{ items: Post[]; nextCursor: string | null }> {
    const limit = Math.min(options.limit ?? LIMIT_DEFAULT, LIMIT_MAX);

    let query: admin.firestore.Query = options.authorId
      ? this.postsDb
          .where('authorId', '==', options.authorId)
          .orderBy('createdAt', 'desc')
      : this.postsDb.orderBy('createdAt', 'desc');

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
}
