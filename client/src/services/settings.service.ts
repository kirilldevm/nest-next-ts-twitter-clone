import { ENDPOINTS } from '@/config/endpoints.config';
import { auth } from '@/config/firebase.config';
import api from '@/lib/api';
import {
  ChangePasswordFormData,
  UpdateProfileFormData,
} from '@/schemas/settings.schema';
import type { User } from '@/types';
import { isAxiosError } from 'axios';
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from 'firebase/auth';
import {
  deleteProfileImage,
  deleteProfileImageByUrl,
  uploadProfileImage,
} from '@/services/storage.service';

export class SettingsService {
  async updateProfile(
    data: UpdateProfileFormData,
    currentPhotoURL?: string | null,
  ): Promise<User> {
    const { photoURL: photoFile, ...rest } = data;

    let newPhotoURL: string | undefined;
    let uploadedPath: string | undefined;

    if (photoFile) {
      const result = await uploadProfileImage(photoFile);
      newPhotoURL = result.url;
      uploadedPath = result.path;
    }

    try {
      if (newPhotoURL && currentPhotoURL) {
        try {
          await deleteProfileImageByUrl(currentPhotoURL);
        } catch {
          // Old image may not exist or URL may be external (e.g. Google avatar)
        }
      }

      const response = await api.patch<User>(ENDPOINTS.USER.ME, {
        ...rest,
        photoURL: newPhotoURL,
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

  async changePassword(data: ChangePasswordFormData): Promise<void> {
    try {
      const authUser = auth.currentUser;
      if (!authUser?.email) {
        throw new Error('You must be signed in to change password');
      }
      const credential = EmailAuthProvider.credential(
        authUser.email,
        data.currentPassword,
      );
      await reauthenticateWithCredential(authUser, credential);
      await updatePassword(authUser, data.newPassword);
    } catch (error) {
      const err = error as { code?: string };
      if (
        err.code === 'auth/wrong-password' ||
        err.code === 'auth/invalid-credential'
      ) {
        throw new Error('Current password is incorrect');
      } else {
        throw new Error('Failed to change password');
      }
    }
  }

  async deleteProfile(): Promise<void> {
    try {
      await api.delete(ENDPOINTS.USER.ME);
    } catch (error) {
      if (isAxiosError(error) && error.response?.data?.message) {
        throw new Error(String(error.response.data.message));
      }
      throw error;
    }
  }

  async getUser(id: string): Promise<User | null> {
    const response = await api.get<User | null>(ENDPOINTS.USER.BY_ID(id));
    return response.data;
  }
}

export const settingsService = new SettingsService();
