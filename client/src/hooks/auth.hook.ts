import { DEFAULT_LOGIN_REDIRECT } from '@/config/routes.config';
import { type SignupInput } from '@/schemas/auth.schema';
import { authService } from '@/services/auth.service';
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
  return useMutation({
    mutationFn: (data: SignupInput) => authService.signup(data),
    onSuccess: (data) => {
      console.log('signup successful', data);
      toast.success(data.message);
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'Signup failed'));
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
    onSuccess: (data) => {
      toast.success('Signin with Google successful');
      router.push(DEFAULT_LOGIN_REDIRECT);
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'Signin with Google failed'));
    },
  });
}
