import { ENDPOINTS } from '@/config/endpoints.config';
import api from '@/lib/api';
import { type SignupInput } from '@/schemas/auth.schema';
import type {
  SigninResponse,
  SigninWithGoogleResponse,
  SignupResponse,
} from '@/types';

export class AuthService {
  async signup(data: SignupInput) {
    const { confirmPassword, profileImage, ...rest } = data;
    if (confirmPassword !== rest.password) {
      throw new Error('Passwords do not match');
    }

    if (profileImage) {
      const formData = new FormData();
      formData.append('email', rest.email);
      formData.append('password', rest.password);
      formData.append('firstName', rest.firstName);
      formData.append('lastName', rest.lastName);
      formData.append('profileImage', profileImage);

      const response = await api.post<SignupResponse>(
        ENDPOINTS.AUTH.SIGNUP,
        formData,
      );
      return response.data;
    }

    const response = await api.post<SignupResponse>(
      ENDPOINTS.AUTH.SIGNUP,
      rest,
    );
    return response.data;
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
