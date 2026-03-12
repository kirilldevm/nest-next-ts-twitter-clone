import { ENDPOINTS } from '@/config/endpoints.config';
import api from '@/lib/api';
import type { Post } from '@/types';
import { isAxiosError } from 'axios';

export type ListPostsParams = {
  authorId?: string;
  limit?: number;
  cursor?: string;
};

export type ListPostsResponse = {
  items: Post[];
  nextCursor: string | null;
};

export class PostsService {
  async listPosts(params: ListPostsParams): Promise<ListPostsResponse> {
    try {
      const searchParams = new URLSearchParams();
      if (params.authorId) searchParams.set('authorId', params.authorId);
      if (params.limit) searchParams.set('limit', String(params.limit));
      if (params.cursor) searchParams.set('cursor', params.cursor);

      const query = searchParams.toString();
      const url = query ? `${ENDPOINTS.POST.LIST}?${query}` : ENDPOINTS.POST.LIST;

      const response = await api.get<ListPostsResponse>(url);
      const data = response.data;

      return {
        items: (data.items ?? []).map((item) => ({
          ...item,
          createdAt:
            typeof item.createdAt === 'string'
              ? new Date(item.createdAt)
              : item.createdAt,
        })),
        nextCursor: data.nextCursor ?? null,
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
