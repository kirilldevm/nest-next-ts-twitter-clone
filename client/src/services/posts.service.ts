import { ENDPOINTS } from '@/config/endpoints.config';
import api from '@/lib/api';
import type { Post } from '@/types';
import { isAxiosError } from 'axios';

export type ListPostsParams = {
  authorId?: string;
  limit?: number;
  cursor?: string;
  sortBy?: 'createdAt' | 'engagement';
};

export type ListPostsResponse = {
  items: Post[];
  nextCursor: string | null;
};

export type SearchPostItem = Post & {
  author?: { displayName: string; photoURL: string | null };
};

export type SearchPostsParams = {
  q: string;
  page?: number;
  limit?: number;
};

export type SearchPostsResponse = {
  items: SearchPostItem[];
  nextPage: number | null;
  totalHits?: number;
};

function mapPostDates<T extends { createdAt?: Date | string }>(item: T): T {
  return {
    ...item,
    createdAt:
      typeof item.createdAt === 'string'
        ? new Date(item.createdAt)
        : item.createdAt ?? new Date(),
  } as T;
}

export class PostsService {
  async listPosts(params: ListPostsParams): Promise<ListPostsResponse> {
    try {
      const searchParams = new URLSearchParams();
      if (params.authorId) searchParams.set('authorId', params.authorId);
      if (params.limit) searchParams.set('limit', String(params.limit));
      if (params.cursor) searchParams.set('cursor', params.cursor);
      if (params.sortBy) searchParams.set('sortBy', params.sortBy);

      const query = searchParams.toString();
      const url = query ? `${ENDPOINTS.POST.LIST}?${query}` : ENDPOINTS.POST.LIST;

      const response = await api.get<ListPostsResponse>(url);
      const data = response.data;

      return {
        items: (data.items ?? []).map(mapPostDates),
        nextCursor: data.nextCursor ?? null,
      };
    } catch (error) {
      if (isAxiosError(error) && error.response?.data?.message) {
        throw new Error(String(error.response.data.message));
      }
      throw error;
    }
  }

  async searchPosts(params: SearchPostsParams): Promise<SearchPostsResponse> {
    try {
      const searchParams = new URLSearchParams();
      searchParams.set('q', params.q);
      if (params.page !== undefined) searchParams.set('page', String(params.page));
      if (params.limit) searchParams.set('limit', String(params.limit));

      const response = await api.get<SearchPostsResponse>(
        `${ENDPOINTS.POST.SEARCH}?${searchParams.toString()}`,
      );
      const data = response.data;

      return {
        items: (data.items ?? []).map(mapPostDates),
        nextPage: data.nextPage ?? null,
        totalHits: data.totalHits,
      };
    } catch (error) {
      if (isAxiosError(error) && error.response?.data?.message) {
        throw new Error(String(error.response.data.message));
      }
      throw error;
    }
  }
}

export const postsService = new PostsService();
