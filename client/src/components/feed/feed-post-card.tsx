'use client';

import PostCard from '@/components/posts/post-card';
import { getDisplayName } from '@/helpers';
import { useUser } from '@/hooks/user.hook';
import type { Post } from '@/types';
import type { SearchPostItem } from '@/services/posts.service';
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';

type FeedPostCardProps = {
  post: Post | SearchPostItem;
};

export default function FeedPostCard({ post }: FeedPostCardProps) {
  const hasEmbeddedAuthor = 'author' in post && post.author;
  const { data: user, isLoading } = useUser(
    hasEmbeddedAuthor ? undefined : post.authorId || undefined,
  );

  if (!hasEmbeddedAuthor && isLoading) {
    return <FeedPostCardSkeleton />;
  }

  const author = hasEmbeddedAuthor
    ? post.author!
    : user
      ? { displayName: getDisplayName(user), photoURL: user.photoURL }
      : { displayName: 'Unknown', photoURL: null as string | null };

  return <PostCard post={post} author={author} />;
}

export function FeedPostCardSkeleton() {
  return (
    <Box
      sx={{
        display: 'flex',
        gap: 2,
        py: 2,
        px: { xs: 2, sm: 0 },
        borderBottom: 1,
        borderColor: 'divider',
      }}
    >
      <Skeleton variant='circular' width={40} height={40} />
      <Box sx={{ flex: 1 }}>
        <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
          <Skeleton variant='text' width={100} height={20} />
          <Skeleton variant='text' width={40} height={16} />
        </Box>
        <Skeleton variant='text' width='90%' height={24} />
        <Skeleton variant='text' width='70%' height={20} />
      </Box>
    </Box>
  );
}
