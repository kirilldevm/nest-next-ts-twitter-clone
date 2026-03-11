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
  deleteOldProfileImage,
  deleteProfileImage,
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
      const response = await api.patch<User>(ENDPOINTS.USER.ME, {
        ...rest,
        photoURL: newPhotoURL,
      });

      // Delete old image only AFTER server has accepted the new one.
      // Prevents orphaned new uploads and avoids deleting old before we're sure
      // the update succeeded.
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
}

export const settingsService = new SettingsService();
