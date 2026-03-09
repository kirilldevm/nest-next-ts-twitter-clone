import type { User } from './user.type';

export type SignupResponse =
  | {
      success: boolean;
      message: string;
      user: User;
    }
  | {
      message: string;
      error: string;
      statusCode: number;
    };

export type SigninResponse =
  | {
      success: boolean;
      message: string;
      user: User;
    }
  | {
      message: string;
      error: string;
      statusCode: number;
    };

export type SigninWithGoogleResponse =
  | {
      success: boolean;
      message: string;
      user: User;
    }
  | {
      message: string;
      error: string;
      statusCode: number;
    };
