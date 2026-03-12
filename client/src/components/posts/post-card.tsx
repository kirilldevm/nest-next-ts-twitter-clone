'use client';

import Link from '@/components/link';
import { PAGES } from '@/config/pages.config';
import type { Post } from '@/types';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardMedia from '@mui/material/CardMedia';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';

type PostCardProps = {
  post: Post;
  canEdit?: boolean;
};

function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function PostCard({ post, canEdit = false }: PostCardProps) {
  const content = (
    <>
      {post.photoURL && (
        <CardMedia
          component='img'
          image={post.photoURL}
          alt={post.title}
          sx={{
            aspectRatio: '1',
            objectFit: 'cover',
          }}
        />
      )}
      <Box sx={{ p: 1.5 }}>
        <Typography
          variant='subtitle2'
          fontWeight={600}
          noWrap
          sx={{ mb: 0.5 }}
        >
          {post.title}
        </Typography>
        <Typography
          variant='body2'
          color='text.secondary'
          sx={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {post.text}
        </Typography>
        <Typography
          variant='caption'
          color='text.secondary'
          sx={{ mt: 1, display: 'block' }}
        >
          {formatDate(post.createdAt)}
        </Typography>
      </Box>
    </>
  );

  return (
    <Card sx={{ overflow: 'hidden' }}>
      {canEdit ? (
        <Link
          href={PAGES.POST_EDIT(post.id)}
          style={{ textDecoration: 'none', color: 'inherit' }}
        >
          <CardActionArea>{content}</CardActionArea>
        </Link>
      ) : (
        <Box>{content}</Box>
      )}
    </Card>
  );
}

export function PostCardSkeleton() {
  return (
    <Card sx={{ overflow: 'hidden' }}>
      <Skeleton variant='rectangular' sx={{ aspectRatio: '1' }} />
      <Box sx={{ p: 1.5 }}>
        <Skeleton variant='text' width='80%' height={24} />
        <Skeleton variant='text' width='100%' />
        <Skeleton variant='text' width='60%' />
        <Skeleton variant='text' width={80} height={20} sx={{ mt: 1 }} />
      </Box>
    </Card>
  );
}
