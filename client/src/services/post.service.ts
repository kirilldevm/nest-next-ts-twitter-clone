import { ENDPOINTS } from '@/config/endpoints.config';
import api from '@/lib/api';
import { PostFormData } from '@/schemas/post.schema';
import {
  deleteOldProfileImage,
  deleteProfileImage,
  uploadPostImage,
} from '@/services/storage.service';
import type { Post } from '@/types';
import { isAxiosError } from 'axios';

export class PostService {
  async createPost(data: PostFormData): Promise<Post> {
    const { photoURL: photoFile, ...rest } = data;

    let photoURL: string | undefined;
    let uploadedPath: string | undefined;

    if (photoFile) {
      const result = await uploadPostImage(photoFile);
      photoURL = result.url;
      uploadedPath = result.path;
    }

    try {
      const response = await api.post<Post>(ENDPOINTS.POST.LIST, {
        ...rest,
        photoURL,
      });
      return response.data;
    } catch (error) {
      if (uploadedPath) {
        try {
          await deleteProfileImage(uploadedPath);
        } catch {
          // Very bad situation
        }
      }
      if (isAxiosError(error) && error.response?.data?.message) {
        throw new Error(String(error.response.data.message));
      }
      throw error;
    }
  }

  async getPost(id: string): Promise<Post | null> {
    try {
      const response = await api.get<Post>(ENDPOINTS.POST.BY_ID(id));
      return response.data;
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

  async updatePost(
    id: string,
    data: PostFormData,
    options?: {
      currentPhotoURL?: string | null;
      removePhoto?: boolean;
    },
  ): Promise<Post> {
    const { photoURL: photoFile, ...rest } = data;
    const { currentPhotoURL, removePhoto } = options ?? {};

    let newPhotoURL: string | undefined;
    let uploadedPath: string | undefined;

    if (photoFile) {
      const result = await uploadPostImage(photoFile);
      newPhotoURL = result.url;
      uploadedPath = result.path;
    }

    try {
      const photoPayload =
        removePhoto ? null : photoFile ? newPhotoURL : undefined;
      const response = await api.patch<Post>(ENDPOINTS.POST.BY_ID(id), {
        ...rest,
        ...(photoPayload !== undefined && { photoURL: photoPayload }),
      });

      if (newPhotoURL && currentPhotoURL) {
        await deleteOldProfileImage(currentPhotoURL);
      }

      return response.data;
    } catch (error) {
      if (uploadedPath) {
        try {
          await deleteProfileImage(uploadedPath);
        } catch {
          // Very bad situation
        }
      }
      if (isAxiosError(error) && error.response?.data?.message) {
        throw new Error(String(error.response.data.message));
      }
      throw error;
    }
  }

  async deletePost(id: string): Promise<void> {
    try {
      await api.delete(ENDPOINTS.POST.BY_ID(id));
    } catch (error) {
      if (isAxiosError(error) && error.response?.data?.message) {
        throw new Error(String(error.response.data.message));
      }
      throw error;
    }
  }
}

export const postService = new PostService();
