import { ENDPOINTS } from '@/config/endpoints.config';
import api from '@/lib/api';
import { type SignupInput } from '@/schemas/auth.schema';
import type {
  SigninResponse,
  SigninWithGoogleResponse,
  SignupResponse,
} from '@/types';
import {
  deleteProfileImage,
  uploadProfileImage,
} from '@/services/storage.service';

export class AuthService {
  async signup(data: SignupInput) {
    const { confirmPassword, profileImage, ...rest } = data;
    if (confirmPassword !== rest.password) {
      throw new Error('Passwords do not match');
    }

    let profileImageUrl: string | undefined;
    let uploadedPath: string | undefined;

    if (profileImage) {
      const result = await uploadProfileImage(profileImage);
      profileImageUrl = result.url;
      uploadedPath = result.path;
    }

    try {
      const response = await api.post<SignupResponse>(ENDPOINTS.AUTH.SIGNUP, {
        email: rest.email,
        password: rest.password,
        firstName: rest.firstName,
        lastName: rest.lastName,
        profileImageUrl,
      });
      return response.data;
    } catch (error) {
      if (uploadedPath) {
        try {
          await deleteProfileImage(uploadedPath);
        } catch {
          // Best-effort cleanup, ignore deletion errors
        }
      }
      throw error;
    }
  }

  async signin(token: string) {
    const response = await api.post<SigninResponse>(ENDPOINTS.AUTH.SIGNIN, {
      token,
    });
    return response.data;
  }

  async signinWithGoogle(token: string) {
    const response = await api.post<SigninWithGoogleResponse>(
      ENDPOINTS.AUTH.SIGNIN_WITH_GOOGLE,
      {
        token,
      },
    );
    return response.data;
  }
}

export const authService = new AuthService();
