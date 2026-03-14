import { QUERY_KEYS } from '@/config/query-keys.config';
import { reactionService } from '@/services/reaction.service';
import type { Post } from '@/types';
import type {
  Comment,
  ListCommentsResponse,
} from '@/types/comment.type';
import { ReactionTargetType } from '@/types/reaction.type';
import type { InfiniteData } from '@tanstack/react-query';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export function useReaction(targetType: ReactionTargetType, targetId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.REACTION.BY_TARGET(targetType, targetId),
    queryFn: () => reactionService.getReaction(targetType, targetId),
    enabled: !!targetId,
    staleTime: 0,
  });
}

function updateCommentInInfiniteCache(
  queryClient: ReturnType<typeof import('@tanstack/react-query').useQueryClient>,
  commentId: string,
  updates: { likesCount: number; dislikesCount: number },
) {
  queryClient.setQueriesData(
    {
      predicate: (q) =>
        Array.isArray(q.queryKey) &&
        q.queryKey[0] === 'comment' &&
        q.queryKey[1] === 'list',
    },
    (old: InfiniteData<ListCommentsResponse> | undefined) => {
      if (!old) return old;
      return {
        ...old,
        pages: old.pages.map((page) => ({
          ...page,
          items: page.items.map((c) =>
            c.id === commentId
              ? { ...c, likesCount: updates.likesCount, dislikesCount: updates.dislikesCount }
              : c,
          ),
        })),
      };
    },
  );
}

type ListPostsResponse = { items: Post[]; nextCursor: string | null };
type SearchPostsResponse = {
  items: (Post & { author?: { displayName: string; photoURL: string | null } })[];
  nextPage: number | null;
  totalHits?: number;
};

function updatePostInListCaches(
  queryClient: ReturnType<typeof import('@tanstack/react-query').useQueryClient>,
  postId: string,
  updates: { likesCount: number; dislikesCount: number },
) {
  queryClient.setQueriesData(
    {
      predicate: (q) =>
        Array.isArray(q.queryKey) && q.queryKey[0] === 'posts',
    },
    (old: ListPostsResponse | SearchPostsResponse | undefined) => {
      if (!old || !('items' in old) || !Array.isArray(old.items)) return old;
      return {
        ...old,
        items: old.items.map((p) =>
          p.id === postId
            ? { ...p, likesCount: updates.likesCount, dislikesCount: updates.dislikesCount }
            : p,
        ),
      };
    },
  );
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
        updatePostInListCaches(queryClient, variables.targetId, {
          likesCount: data.likesCount,
          dislikesCount: data.dislikesCount,
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
        updateCommentInInfiniteCache(queryClient, variables.targetId, {
          likesCount: data.likesCount,
          dislikesCount: data.dislikesCount,
        });
      }
    },
  });
}
