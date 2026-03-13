'use client';

import { PAGES } from '@/config/pages.config';
import ReactionButtons from '@/components/reactions/reaction-buttons';
import { formatRelativeTime } from '@/helpers';
import type { Post } from '@/types';
import { ReactionTargetType } from '@/types/reaction.type';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import CardMedia from '@mui/material/CardMedia';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Link from 'next/link';

export type PostCardAuthor = {
  displayName: string;
  photoURL?: string | null;
};

type PostCardProps = {
  post: Post;
  author: PostCardAuthor;
  variant?: 'compact' | 'full' | 'detail';
  showReactions?: boolean;
};

export default function PostCard({
  post,
  author,
  variant = 'full',
  showReactions = true,
}: PostCardProps) {
  const displayName = author.displayName;
  const authorId = post.authorId;
  const avatarLetter = displayName[0]?.toUpperCase() ?? '?';

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 2,
        py: 2,
        px: { xs: 2, sm: 0 },
        '&:not(:last-child)': { borderBottom: 1, borderColor: 'divider' },
      }}
    >
      <Avatar
        src={author?.photoURL ?? undefined}
        alt={displayName}
        sx={{ width: 40, height: 40, flexShrink: 0 }}
      >
        {avatarLetter}
      </Avatar>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            mb: 0.5,
          }}
        >
          <Box component={Link} href={PAGES.PROFILE_BY_ID(authorId)}>
            <Typography variant='subtitle2' fontWeight={600}>
              {displayName}
            </Typography>
          </Box>
          <Typography variant='caption' color='text.secondary'>
            · {formatRelativeTime(post.createdAt)}
          </Typography>
        </Box>

        <Box
          component={variant !== 'detail' ? Link : 'div'}
          href={variant !== 'detail' ? PAGES.POST_PAGE(post.id) : undefined}
          sx={{
            textDecoration: 'none',
            color: 'inherit',
          }}
        >
          {post.title && (
            <Typography
              variant='body1'
              fontWeight={600}
              sx={{
                mb: post.text ? 0.5 : 0,
                ...(variant === 'compact' && {
                  display: '-webkit-box',
                  WebkitLineClamp: 1,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }),
              }}
            >
              {post.title}
            </Typography>
          )}
          <Typography
            variant='body2'
            color='text.secondary'
            sx={{
              ...(variant !== 'detail' && {
                display: '-webkit-box',
                WebkitLineClamp: variant === 'compact' ? 2 : 4,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }),
            }}
          >
            {post.text}
          </Typography>
        </Box>

        {post.photoURL && (
          <Box
            sx={{
              mt: 1.5,
              borderRadius: 2,
              overflow: 'hidden',
              maxWidth: 360,
            }}
          >
            <CardMedia
              component='img'
              image={post.photoURL}
              alt={post.title}
              sx={{
                borderRadius: 2,
                maxHeight:
                  variant === 'compact'
                    ? 200
                    : variant === 'detail'
                      ? 500
                      : 400,
                objectFit: 'cover',
              }}
            />
          </Box>
        )}

        {showReactions && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              mt: 1.5,
            }}
          >
            <ReactionButtons
              targetType={ReactionTargetType.POST}
              targetId={post.id}
              likesCount={post.likesCount ?? 0}
              dislikesCount={post.dislikesCount ?? 0}
            />

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <IconButton
                size='small'
                sx={{ color: 'text.secondary', p: 0.5 }}
                disabled
              >
                <ChatBubbleOutlineIcon fontSize='small' />
              </IconButton>
              {(post.commentsCount ?? 0) > 0 && (
                <Typography variant='caption' color='text.secondary'>
                  {post.commentsCount}
                </Typography>
              )}
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
}
