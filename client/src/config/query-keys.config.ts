export const QUERY_KEYS = {
  USER: {
    ME: 'user.me',
    BY_ID: (id: string) => ['user', id] as const,
  },
};
