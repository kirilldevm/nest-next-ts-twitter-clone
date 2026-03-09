import { ENDPOINTS } from '@/config/endpoints.config';
import { type SignupInput } from '@/schemas/auth.schema';
import axios from 'axios';

export class AuthService {
  async signup(data: SignupInput) {
    const { confirmPassword, ...rest } = data;
    if (confirmPassword !== rest.password) {
      throw new Error('Passwords do not match');
    }
    const response = await axios.post(ENDPOINTS.AUTH.SIGNUP, rest);
    return response.data;
  }

  async signin(token: string) {
    const response = await axios.post(ENDPOINTS.AUTH.SIGNIN, { token });
    return response.data;
  }
}

export const authService = new AuthService();
