import type { User } from './user.type';

export type SignupResponse = {
  success: boolean;
  message: string;
  user: User;
};

export type SigninResponse = {
  success: boolean;
  message: string;
  user: User;
};

export type SigninWithGoogleResponse = {
  success: boolean;
  message: string;
  user: User;
};
