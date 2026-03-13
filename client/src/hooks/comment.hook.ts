import { QUERY_KEYS } from '@/config/query-keys.config';
import { commentService } from '@/services/comment.service';
import type { CreateCommentParams } from '@/types/comment.type';
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { toast } from 'sonner';

export function useComment(commentId: string | undefined) {
  return useQuery({
    queryKey: QUERY_KEYS.COMMENT.BY_ID(commentId ?? ''),
    queryFn: () => commentService.getComment(commentId!),
    enabled: !!commentId,
  });
}

export function useComments(postId: string | undefined, parentId?: string | null) {
  return useInfiniteQuery({
    queryKey: QUERY_KEYS.COMMENT.LIST(postId ?? '', parentId),
    queryFn: ({ pageParam }) =>
      commentService.listComments({
        postId: postId!,
        parentId: parentId ?? null,
        limit: 20,
        cursor: pageParam,
      }),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    initialPageParam: undefined as string | undefined,
    enabled: !!postId,
  });
}

export function useCreateCommentMutation(postId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCommentParams) => commentService.createComment(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.COMMENT.LIST(postId),
      });
      if (variables.parentId) {
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.COMMENT.LIST(postId, variables.parentId),
        });
      }
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.POST.BY_ID(postId) });
      toast.success('Comment added');
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : 'Failed to add comment',
      );
    },
  });
}

export function useUpdateCommentMutation(postId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, content }: { id: string; content: string }) =>
      commentService.updateComment(id, content),
    onSuccess: (data) => {
      queryClient.setQueryData(QUERY_KEYS.COMMENT.BY_ID(data.id), data);
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.COMMENT.LIST(postId),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.COMMENT.LIST(postId, data.parentId),
      });
      toast.success('Comment updated');
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : 'Failed to update comment',
      );
    },
  });
}

export function useDeleteCommentMutation(postId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => commentService.deleteComment(id),
    onSuccess: (_, commentId) => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.COMMENT.LIST(postId),
      });
      queryClient.removeQueries({ queryKey: QUERY_KEYS.COMMENT.BY_ID(commentId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.POST.BY_ID(postId) });
      toast.success('Comment deleted');
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : 'Failed to delete comment',
      );
    },
  });
}
