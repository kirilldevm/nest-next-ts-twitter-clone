import { ENDPOINTS } from '@/config/endpoints.config';
import api from '@/lib/api';
import type {
  Comment,
  CreateCommentParams,
  ListCommentsParams,
  ListCommentsResponse,
} from '@/types/comment.type';
import { isAxiosError } from 'axios';

function mapComment(item: Comment): Comment {
  return {
    ...item,
    createdAt:
      typeof item.createdAt === 'string'
        ? new Date(item.createdAt)
        : item.createdAt,
    updatedAt:
      typeof item.updatedAt === 'string'
        ? new Date(item.updatedAt)
        : item.updatedAt,
  };
}

export class CommentService {
  async listComments(params: ListCommentsParams): Promise<ListCommentsResponse> {
    try {
      const searchParams = new URLSearchParams();
      searchParams.set('postId', params.postId);
      if (params.parentId !== undefined && params.parentId !== null) {
        searchParams.set('parentId', params.parentId);
      }
      if (params.limit) searchParams.set('limit', String(params.limit));
      if (params.cursor) searchParams.set('cursor', params.cursor);

      const response = await api.get<ListCommentsResponse>(
        `${ENDPOINTS.COMMENT.LIST}?${searchParams.toString()}`,
      );
      const data = response.data;

      return {
        items: (data.items ?? []).map(mapComment),
        nextCursor: data.nextCursor ?? null,
      };
    } catch (error) {
      if (isAxiosError(error) && error.response?.data?.message) {
        throw new Error(String(error.response.data.message));
      }
      throw error;
    }
  }

  async getComment(id: string): Promise<Comment | null> {
    try {
      const response = await api.get<Comment>(ENDPOINTS.COMMENT.BY_ID(id));
      return mapComment(response.data);
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      if (isAxiosError(error) && error.response?.data?.message) {
        throw new Error(String(error.response.data.message));
      }
      throw error;
    }
  }

  async createComment(data: CreateCommentParams): Promise<Comment> {
    try {
      const response = await api.post<Comment>(ENDPOINTS.COMMENT.LIST, {
        postId: data.postId,
        content: data.content,
        parentId: data.parentId ?? null,
      });
      return mapComment(response.data);
    } catch (error) {
      if (isAxiosError(error) && error.response?.data?.message) {
        throw new Error(String(error.response.data.message));
      }
      throw error;
    }
  }

  async updateComment(id: string, content: string): Promise<Comment> {
    try {
      const response = await api.patch<Comment>(ENDPOINTS.COMMENT.BY_ID(id), {
        content,
      });
      return mapComment(response.data);
    } catch (error) {
      if (isAxiosError(error) && error.response?.data?.message) {
        throw new Error(String(error.response.data.message));
      }
      throw error;
    }
  }

  async deleteComment(id: string): Promise<void> {
    try {
      await api.delete(ENDPOINTS.COMMENT.BY_ID(id));
    } catch (error) {
      if (isAxiosError(error) && error.response?.data?.message) {
        throw new Error(String(error.response.data.message));
      }
      throw error;
    }
  }
}

export const commentService = new CommentService();
