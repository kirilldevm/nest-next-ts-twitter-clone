import { QUERY_KEYS } from '@/config/query-keys.config';
import { postsService } from '@/services/posts.service';
import type { Post } from '@/types';
import { useQuery } from '@tanstack/react-query';
import { useCallback, useState } from 'react';

const FEED_PAGE_SIZE = 10;

export type UseFeedPostsResult = {
  posts: Post[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  currentPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  nextPage: () => void;
  prevPage: () => void;
};

export function useFeedPosts(): UseFeedPostsResult {
  const [cursorStack, setCursorStack] = useState<(string | undefined)[]>([
    undefined,
  ]);
  const [currentPage, setCurrentPage] = useState(1);

  const cursor = cursorStack[currentPage - 1];

  const { data, isLoading, isError, error } = useQuery({
    queryKey: [...QUERY_KEYS.POSTS.LIST(), FEED_PAGE_SIZE, cursor ?? 'first'],
    queryFn: () =>
      postsService.listPosts({
        limit: FEED_PAGE_SIZE,
        cursor: cursor ?? undefined,
      }),
  });

  const nextCursor = data?.nextCursor ?? null;
  const hasNextPage = nextCursor !== null;

  const nextPage = useCallback(() => {
    if (!hasNextPage) return;
    const newStack = [...cursorStack];
    if (newStack.length <= currentPage) {
      newStack.push(nextCursor!);
    }
    setCursorStack(newStack);
    setCurrentPage((p) => p + 1);
  }, [cursorStack, currentPage, hasNextPage, nextCursor]);

  const prevPage = useCallback(() => {
    if (currentPage <= 1) return;
    setCurrentPage((p) => p - 1);
  }, [currentPage]);

  const hasPrevPage = currentPage > 1;

  return {
    posts: data?.items ?? [],
    isLoading,
    isError,
    error: error instanceof Error ? error : null,
    currentPage,
    hasNextPage,
    hasPrevPage,
    nextPage,
    prevPage,
  };
}
