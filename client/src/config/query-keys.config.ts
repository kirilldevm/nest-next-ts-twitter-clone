export const QUERY_KEYS = {
  USER: {
    ME: 'user.me',
    BY_ID: (id: string) => ['user', id] as const,
  },
  POST: {
    LIST: ['post', 'list'] as const,
    BY_ID: (id: string) => ['post', id] as const,
  },
};
