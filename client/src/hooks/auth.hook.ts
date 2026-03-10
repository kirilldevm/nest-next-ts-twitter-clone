import { DEFAULT_LOGIN_REDIRECT } from '@/config/routes.config';
import { type SignupInput } from '@/schemas/auth.schema';
import { authService } from '@/services/auth.service';
import { SigninWithGoogleResponse, SignupResponse } from '@/types';
import { useMutation } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

function getErrorMessage(error: unknown, fallback: string): string {
  if (isAxiosError(error) && error.response?.data?.message) {
    return String(error.response.data.message);
  }
  return error instanceof Error ? error.message : fallback;
}

export function useSignupMutation() {
  return useMutation<SignupResponse, Error, SignupInput>({
    mutationFn: (data: SignupInput) => authService.signup(data),
    onSuccess: (data: SignupResponse) => {
      toast.success(data.message);
    },
    onError: (error: unknown) => {
      console.log(error);
    },
  });
}

export function useSigninMutation() {
  const router = useRouter();
  return useMutation({
    mutationFn: (token: string) => authService.signin(token),
    onSuccess: () => {
      toast.success('Signin successful');
      router.push(DEFAULT_LOGIN_REDIRECT);
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'Signin failed'));
    },
  });
}

export function useSigninWithGoogleMutation() {
  const router = useRouter();
  return useMutation({
    mutationFn: (token: string) => authService.signinWithGoogle(token),
    onSuccess: (data: SigninWithGoogleResponse) => {
      toast.success(data.message || 'Signin with Google successful');
      router.push(DEFAULT_LOGIN_REDIRECT);
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'Signin with Google failed'));
    },
  });
}
