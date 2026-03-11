import { QUERY_KEYS } from '@/config/query-keys.config';
import { useRouter } from 'next/navigation';
import { postService } from '@/services/post.service';
import { PostFormData } from '@/schemas/post.schema';
import { PAGES } from '@/config/pages.config';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export function usePost(postId: string | undefined) {
  return useQuery({
    queryKey: QUERY_KEYS.POST.BY_ID(postId ?? ''),
    queryFn: () => postService.getPost(postId!),
    enabled: !!postId,
  });
}

export function useCreatePostMutation() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (data: PostFormData) => postService.createPost(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.POST.LIST });
      toast.success('Post created');
      router.push(PAGES.PROFILE);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to create post');
    },
  });
}

export function useUpdatePostMutation(postId: string) {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: ({
      data,
      currentPhotoURL,
    }: {
      data: PostFormData;
      currentPhotoURL?: string | null;
    }) => postService.updatePost(postId, data, currentPhotoURL),
    onSuccess: (data) => {
      queryClient.setQueryData(QUERY_KEYS.POST.BY_ID(postId), data);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.POST.LIST });
      toast.success('Post updated');
      router.push(PAGES.PROFILE);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to update post');
    },
  });
}
