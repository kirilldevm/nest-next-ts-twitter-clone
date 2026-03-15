'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { type ReactNode, useState } from 'react';

export function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            staleTime: 0,
            retry: (failureCount, error) => {
              // Don't retry on 401 - avoids rapid repeated force-logout
              if (error && typeof error === 'object' && 'response' in error) {
                const err = error as { response?: { status?: number } };
                if (err.response?.status === 401) return false;
              }
              return failureCount < 2;
            },
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
