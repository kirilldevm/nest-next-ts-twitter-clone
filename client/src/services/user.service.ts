import { ENDPOINTS } from '@/config/endpoints.config';
import api from '@/lib/api';
import type { User } from '@/types';
import { isAxiosError } from 'axios';

export class UserService {
  async getUser(id: string): Promise<User | null> {
    try {
      const response = await api.get<User | null>(ENDPOINTS.USER.BY_ID(id));
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

  async sendVerificationEmail(): Promise<
    | {
        success: boolean;
        message: string;
      }
    | Error
  > {
    try {
      const response = await api.post(ENDPOINTS.USER.SEND_VERIFICATION_EMAIL);
      return response.data;
    } catch (error) {
      if (isAxiosError(error) && error.response?.data?.message) {
        throw new Error(String(error.response.data.message));
      }
      throw error;
    }
  }
}

export const userService = new UserService();
