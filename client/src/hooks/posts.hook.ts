import { QUERY_KEYS } from '@/config/query-keys.config';
import { postsService } from '@/services/posts.service';
import { useInfiniteQuery } from '@tanstack/react-query';

const POSTS_PAGE_SIZE = 12;

export type UsePostsParams = {
  authorId?: string;
  pageSize?: number;
};

export function usePosts({ authorId, pageSize = POSTS_PAGE_SIZE }: UsePostsParams) {
  return useInfiniteQuery({
    queryKey: [...QUERY_KEYS.POSTS.LIST(authorId), pageSize],
    queryFn: ({ pageParam }) =>
      postsService.listPosts({
        authorId,
        limit: pageSize,
        cursor: pageParam as string | undefined,
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });
}
