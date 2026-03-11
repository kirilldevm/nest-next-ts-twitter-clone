import { QUERY_KEYS } from '@/config/query-keys.config';
import { userService } from '@/services/user.service';
import { useQuery } from '@tanstack/react-query';

export function useUser(userId: string | undefined) {
  return useQuery({
    queryKey: QUERY_KEYS.USER.BY_ID(userId ?? ''),
    queryFn: () => userService.getUser(userId!),
    enabled: !!userId,
  });
}
