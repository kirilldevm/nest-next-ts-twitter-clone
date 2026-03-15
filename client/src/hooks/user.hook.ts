import { QUERY_KEYS } from '@/config/query-keys.config';
import { userService } from '@/services/user.service';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

export function useUser(userId: string | undefined) {
  return useQuery({
    queryKey: QUERY_KEYS.USER.BY_ID(userId ?? ''),
    queryFn: () => userService.getUser(userId!),
    enabled: !!userId,
    staleTime: 0,
  });
}

export function useSendVerificationEmail() {
  return useMutation({
    mutationFn: () => userService.sendVerificationEmail(),
    onSuccess: (data) => {
      if (data && 'success' in data && data.success) {
        toast.success(data.message);
      }
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to send verification email',
      );
    },
  });
}
