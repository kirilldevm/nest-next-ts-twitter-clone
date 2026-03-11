export type Post = {
  id: string;
  authorId: string;
  title: string;
  text: string;
  photoURL: string | null;
  createdAt: Date;
  likesCount: number;
  dislikesCount: number;
  commentsCount: number;
};
