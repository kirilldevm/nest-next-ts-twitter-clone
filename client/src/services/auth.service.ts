import { ENDPOINTS } from '@/config/endpoints.config';
import { auth } from '@/config/firebase.config';
import api from '@/lib/api';
import { type SigninInput, type SignupInput } from '@/schemas/auth.schema';
import {
  deleteProfileImage,
  uploadProfileImage,
} from '@/services/storage.service';
import type {
  SigninResponse,
  SigninWithGoogleResponse,
  SignupResponse,
} from '@/types';
import { isAxiosError } from 'axios';
import {
  fetchSignInMethodsForEmail,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';

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

      if ('error' in response.data) {
        throw new Error(response.data.message);
      }

      return response.data;
    } catch (error) {
      if (uploadedPath) {
        try {
          await deleteProfileImage(uploadedPath);
        } catch {
          // Very bad situation, but we can't do anything about it
        }
      }
      if (isAxiosError(error) && error.response?.data?.message) {
        throw new Error(String(error.response.data.message));
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

  async signinWithEmailPassword(data: SigninInput) {
    try {
      const credential = await signInWithEmailAndPassword(
        auth,
        data.email,
        data.password,
      );

      const token = await credential.user.getIdToken();
      const response = await api.post<SigninResponse>(ENDPOINTS.AUTH.SIGNIN, {
        token,
      });

      const result = response.data;

      if ('error' in result || !result.success) {
        const message = result.message || 'Signin failed';
        throw new Error(message);
      }

      return { user: result.user, token };
    } catch (error) {
      signOut(auth);
      if (isAxiosError(error) && error.response?.data?.message) {
        throw new Error(String(error.response.data.message));
      }

      const authError = error as Error & { code?: string };
      const code = authError.code ?? '';
      const message = authError.message ?? '';
      const isInvalidCredential =
        code === 'auth/invalid-credential' ||
        code === 'auth/invalid-login-credentials' ||
        code === 'auth/wrong-password' ||
        message.includes('INVALID_LOGIN_CREDENTIALS');

      if (isInvalidCredential) {
        const methods = await fetchSignInMethodsForEmail(auth, data.email);
        if (methods.includes('google.com')) {
          throw new Error(
            methods.includes('password')
              ? 'Invalid email or password. You can also sign in with Google using the button above.'
              : 'This account uses Google sign-in. Please use the Google button above.',
          );
        }
        throw new Error('Invalid email or password');
      }

      if (code === 'auth/user-not-found') {
        throw new Error('No account found with this email');
      }
      if (code === 'auth/invalid-email') {
        throw new Error('Invalid email address');
      }

      throw error;
    }
  }

  async checkEmailForPasswordReset(email: string) {
    try {
      const response = await api.post<{ ok: boolean }>(
        ENDPOINTS.AUTH.FORGOT_PASSWORD,
        { email },
      );
      return response.data;
    } catch (error) {
      if (isAxiosError(error) && error.response?.data?.message) {
        throw new Error(String(error.response.data.message));
      }
      throw error;
    }
  }

  async checkAndSendPasswordResetEmail(email: string) {
    try {
      const response = await this.checkEmailForPasswordReset(email);
      if (!response.ok) {
        throw new Error('No account found with this email');
      }
      await sendPasswordResetEmail(auth, email);
      return { success: true, message: 'Password reset email sent' };
    } catch (error) {
      if (isAxiosError(error) && error.response?.data?.message) {
        throw new Error(String(error.response.data.message));
      }
      throw error;
    }
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
