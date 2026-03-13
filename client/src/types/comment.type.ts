export type Comment = {
  id: string;
  postId: string;
  authorId: string;
  authorDisplayName: string;
  authorPhotoURL: string | null;
  content: string;
  parentId: string | null;
  replyCount: number;
  likesCount: number;
  dislikesCount: number;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateCommentParams = {
  postId: string;
  content: string;
  parentId?: string | null;
};

export type ListCommentsParams = {
  postId: string;
  parentId?: string | null;
  limit?: number;
  cursor?: string;
};

export type ListCommentsResponse = {
  items: Comment[];
  nextCursor: string | null;
};
