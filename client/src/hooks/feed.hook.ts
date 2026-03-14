import { QUERY_KEYS } from '@/config/query-keys.config';
import { postsService } from '@/services/posts.service';
import type { Post } from '@/types';
import { useQuery } from '@tanstack/react-query';
import { useCallback, useEffect, useDeferredValue, useState } from 'react';

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
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  totalHits?: number;
};

export function useFeedPosts(): UseFeedPostsResult {
  const [searchQuery, setSearchQuery] = useState('');
  const deferredSearch = useDeferredValue(searchQuery);
  const [cursorStack, setCursorStack] = useState<(string | undefined)[]>([
    undefined,
  ]);
  const [searchPage, setSearchPage] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const cursor = cursorStack[currentPage - 1];
  const trimmedSearch = deferredSearch.trim();
  const isSearchMode = trimmedSearch.length > 0;

  useEffect(() => {
    setSearchPage(0);
  }, [trimmedSearch]);

  const feedQuery = useQuery({
    queryKey: [
      ...QUERY_KEYS.POSTS.LIST(undefined, 'engagement'),
      FEED_PAGE_SIZE,
      cursor ?? 'first',
    ],
    queryFn: () =>
      postsService.listPosts({
        limit: FEED_PAGE_SIZE,
        cursor: cursor ?? undefined,
        sortBy: 'engagement',
      }),
    enabled: !isSearchMode,
  });

  const searchQueryResult = useQuery({
    queryKey: QUERY_KEYS.POSTS.SEARCH(trimmedSearch, searchPage),
    queryFn: () =>
      postsService.searchPosts({
        q: trimmedSearch,
        page: searchPage,
        limit: FEED_PAGE_SIZE,
      }),
    enabled: isSearchMode,
  });

  const feedData = feedQuery.data;
  const searchData = searchQueryResult.data;

  const posts = isSearchMode ? searchData?.items ?? [] : feedData?.items ?? [];

  const isLoading = isSearchMode
    ? searchQueryResult.isLoading
    : feedQuery.isLoading;
  const isError = isSearchMode
    ? searchQueryResult.isError
    : feedQuery.isError;
  const error = isSearchMode
    ? searchQueryResult.error
    : feedQuery.error;

  const hasNextPage = isSearchMode
    ? searchData?.nextPage !== null && searchData?.nextPage !== undefined
    : (feedData?.nextCursor ?? null) !== null;

  const nextPage = useCallback(() => {
    if (isSearchMode) {
      if (searchData?.nextPage != null) {
        setSearchPage(searchData.nextPage!);
      }
    } else {
      const nextCursor = feedData?.nextCursor;
      if (nextCursor) {
        const newStack = [...cursorStack];
        if (newStack.length <= currentPage) {
          newStack.push(nextCursor);
        }
        setCursorStack(newStack);
        setCurrentPage((p) => p + 1);
      }
    }
  }, [
    isSearchMode,
    searchData?.nextPage,
    feedData?.nextCursor,
    cursorStack,
    currentPage,
  ]);

  const prevPage = useCallback(() => {
    if (isSearchMode) {
      setSearchPage((p) => Math.max(0, p - 1));
    } else if (currentPage > 1) {
      setCurrentPage((p) => p - 1);
    }
  }, [isSearchMode, currentPage]);

  const hasPrevPage = isSearchMode ? searchPage > 0 : currentPage > 1;

  const displayPage = isSearchMode ? searchPage + 1 : currentPage;

  return {
    posts,
    isLoading,
    isError,
    error: error instanceof Error ? error : null,
    currentPage: displayPage,
    hasNextPage,
    hasPrevPage,
    nextPage,
    prevPage,
    searchQuery,
    setSearchQuery,
    totalHits: searchData?.totalHits,
  };
}
