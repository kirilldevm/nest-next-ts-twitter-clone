import { Injectable } from '@nestjs/common';
import { algoliasearch } from 'algoliasearch';
import type { Post } from '../post/entity/post.entity';

export type SearchPostsResult = {
  items: Post[];
  nextPage: number | null;
  totalHits?: number;
};

@Injectable()
export class AlgoliaService {
  private get client() {
    const appId = process.env.ALGOLIA_APP_ID;
    const apiKey = process.env.ALGOLIA_ADMIN_API_KEY;

    if (!appId || !apiKey) {
      throw new Error(
        'Algolia is not configured. Set ALGOLIA_APP_ID and ALGOLIA_ADMIN_API_KEY.',
      );
    }
    return algoliasearch(appId, apiKey);
  }

  private get indexName(): string {
    return process.env.ALGOLIA_INDEX_NAME ?? 'posts';
  }

  async searchPosts(
    query: string,
    options?: { page?: number; limit?: number },
  ): Promise<SearchPostsResult> {
    const page = Math.max(0, options?.page ?? 0);
    const hitsPerPage = Math.min(50, Math.max(1, options?.limit ?? 10));

    const result = await this.client.searchSingleIndex({
      indexName: this.indexName,
      searchParams: {
        query,
        page,
        hitsPerPage,
        attributesToRetrieve: [
          'objectID',
          'authorId',
          'title',
          'text',
          'photoURL',
          'createdAt',
          'likesCount',
          'dislikesCount',
          'commentsCount',
        ],
      },
    });

    const items: Post[] = (result.hits ?? []).map(
      (hit: Record<string, unknown>) => this.mapHitToPost(hit),
    );

    const totalPages = result.nbPages ?? 0;
    const nextPage = page + 1 < totalPages ? page + 1 : null;

    return {
      items,
      nextPage,
      totalHits: result.nbHits,
    };
  }

  private mapHitToPost(hit: Record<string, unknown>): Post {
    const createdAt = hit.createdAt;
    const safeStr = (v: unknown): string =>
      v != null && (typeof v === 'string' || typeof v === 'number')
        ? String(v)
        : '';

    let date = new Date();
    if (createdAt != null) {
      if (typeof createdAt === 'number') {
        date =
          createdAt > 1e12
            ? new Date(createdAt)
            : new Date(createdAt * 1000);
      } else if (typeof createdAt === 'string') {
        date = new Date(createdAt);
      } else if (
        typeof createdAt === 'object' &&
        createdAt !== null
      ) {
        const obj = createdAt as Record<string, unknown>;
        const seconds =
          (obj.seconds as number) ?? (obj._seconds as number);
        if (typeof seconds === 'number') {
          date = new Date(seconds * 1000);
        } else if ('toDate' in obj && typeof obj.toDate === 'function') {
          date = (obj.toDate as () => Date)();
        } else {
          date = new Date(String(createdAt));
        }
      }
    }

    return {
      id: safeStr(hit.objectID ?? hit.id),
      authorId: safeStr(hit.authorId),
      title: safeStr(hit.title),
      text: safeStr(hit.text),
      photoURL: (hit.photoURL as string) ?? null,
      createdAt: date,
      likesCount: Number(hit.likesCount ?? 0),
      dislikesCount: Number(hit.dislikesCount ?? 0),
      commentsCount: Number(hit.commentsCount ?? 0),
    };
  }
}
