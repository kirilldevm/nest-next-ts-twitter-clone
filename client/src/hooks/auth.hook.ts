import { QUERY_KEYS } from '@/config/query-keys.config';
import { useAuth } from '@/context/auth.context';
import { type SigninInput, type SignupInput } from '@/schemas/auth.schema';
import { authService } from '@/services/auth.service';
import { SigninWithGoogleResponse, SignupResponse } from '@/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
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
  });
}

export function useSigninMutation() {
  const { signin } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SigninInput) =>
      authService.signinWithEmailPassword(data),
    onSuccess: (data) => {
      signin({ user: data.user, token: data.token });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.USER.ME] });
    },
  });
}

export function useSigninWithGoogleMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (token: string) => authService.signinWithGoogle(token),
    onSuccess: (data: SigninWithGoogleResponse) => {
      toast.success(data.message || 'Signin with Google successful');
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.USER.ME] });
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'Signin with Google failed'));
    },
  });
}

export function useCheckAndSendPasswordResetEmailMutation() {
  return useMutation({
    mutationFn: (email: string) =>
      authService.checkAndSendPasswordResetEmail(email),
  });
}
