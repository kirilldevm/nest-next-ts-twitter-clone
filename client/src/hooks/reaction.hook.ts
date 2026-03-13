import { QUERY_KEYS } from '@/config/query-keys.config';
import { reactionService } from '@/services/reaction.service';
import type { Comment } from '@/types/comment.type';
import type { Post } from '@/types';
import { ReactionTargetType } from '@/types/reaction.type';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export function useReaction(
  targetType: ReactionTargetType,
  targetId: string,
) {
  return useQuery({
    queryKey: QUERY_KEYS.REACTION.BY_TARGET(targetType, targetId),
    queryFn: () => reactionService.getReaction(targetType, targetId),
    enabled: !!targetId,
    staleTime: 0,
  });
}

export function useSetReactionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: reactionService.setReaction,
    onSuccess: (data, variables) => {
      queryClient.setQueryData(
        QUERY_KEYS.REACTION.BY_TARGET(variables.targetType, variables.targetId),
        data.type,
      );

      if (variables.targetType === ReactionTargetType.POST) {
        queryClient.setQueryData(
          QUERY_KEYS.POST.BY_ID(variables.targetId),
          (old: Post | undefined) =>
            old
              ? {
                  ...old,
                  likesCount: data.likesCount,
                  dislikesCount: data.dislikesCount,
                }
              : old,
        );
        queryClient.invalidateQueries({
          predicate: (q) => q.queryKey[0] === 'posts',
        });
      } else if (variables.targetType === ReactionTargetType.COMMENT) {
        queryClient.setQueryData(
          QUERY_KEYS.COMMENT.BY_ID(variables.targetId),
          (old: Comment | undefined) =>
            old
              ? {
                  ...old,
                  likesCount: data.likesCount,
                  dislikesCount: data.dislikesCount,
                }
              : old,
        );
        queryClient.invalidateQueries({
          predicate: (q) => q.queryKey[0] === 'comment',
        });
      }
    },
  });
}
