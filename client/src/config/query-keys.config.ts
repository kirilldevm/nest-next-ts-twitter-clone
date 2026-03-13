export const QUERY_KEYS = {
  USER: {
    ME: 'user.me',
    BY_ID: (id: string) => ['user', id] as const,
  },
  POST: {
    LIST: ['post', 'list'] as const,
    BY_ID: (id: string) => ['post', id] as const,
  },
  POSTS: {
    LIST: (authorId?: string) =>
      authorId ? ['posts', 'list', authorId] : ['posts', 'list'],
  },
  REACTION: {
    BY_TARGET: (targetType: string, targetId: string) =>
      ['reaction', targetType, targetId] as const,
  },
  COMMENT: {
    LIST: (postId: string, parentId?: string | null) =>
      parentId
        ? (['comment', 'list', postId, parentId] as const)
        : (['comment', 'list', postId] as const),
    BY_ID: (id: string) => ['comment', id] as const,
  },
};
