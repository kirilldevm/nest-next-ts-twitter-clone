import { DEFAULT_LOGIN_REDIRECT } from '@/config/routes.config';
import { type SignupInput } from '@/schemas/auth.schema';
import { authService } from '@/services/auth.service';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export function useSignupMutation() {
  return useMutation({
    mutationFn: (data: SignupInput) => authService.signup(data),
    onSuccess: () => {
      toast.success('Signup successful');
    },
    onError: (error: unknown) => {
      toast.error(error instanceof Error ? error.message : 'Signup failed');
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
      toast.error(error instanceof Error ? error.message : 'Signin failed');
    },
  });
}
