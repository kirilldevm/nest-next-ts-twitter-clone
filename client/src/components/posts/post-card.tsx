'use client';

import { PAGES } from '@/config/pages.config';
import { formatRelativeTime } from '@/helpers';
import { useReaction, useSetReactionMutation } from '@/hooks/reaction.hook';
import type { Post } from '@/types';
import { ReactionTargetType, ReactionType } from '@/types/reaction.type';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import ThumbDownOffAltIcon from '@mui/icons-material/ThumbDownOffAlt';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import CardMedia from '@mui/material/CardMedia';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Link from 'next/link';
import { useMemo } from 'react';

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
  const { data: userReaction } = useReaction(ReactionTargetType.POST, post.id);
  const { mutate: setReaction, isPending } = useSetReactionMutation();
  const displayName = author.displayName;
  const authorId = post.authorId;
  const avatarLetter = displayName[0]?.toUpperCase() ?? '?';

  const accumulateReactions = useMemo(() => {
    return (post.likesCount ?? 0) - (post.dislikesCount ?? 0);
  }, [post.likesCount, post.dislikesCount]);

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
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <IconButton
                size='small'
                sx={{
                  color:
                    userReaction === ReactionType.LIKE
                      ? 'error.main'
                      : 'text.secondary',
                  p: 0.5,
                }}
                onClick={() =>
                  setReaction({
                    targetId: post.id,
                    targetType: ReactionTargetType.POST,
                    type: ReactionType.LIKE,
                  })
                }
                disabled={isPending}
              >
                {userReaction === ReactionType.LIKE ? (
                  <FavoriteIcon fontSize='small' />
                ) : (
                  <FavoriteBorderIcon fontSize='small' />
                )}
              </IconButton>
            </Box>

            {accumulateReactions ?? (
              <Typography variant='caption' color={'text.secondary'}>
                {accumulateReactions}
              </Typography>
            )}

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <IconButton
                size='small'
                sx={{
                  color:
                    userReaction === ReactionType.DISLIKE
                      ? 'primary.main'
                      : 'text.secondary',
                  p: 0.5,
                }}
                onClick={() =>
                  setReaction({
                    targetId: post.id,
                    targetType: ReactionTargetType.POST,
                    type: ReactionType.DISLIKE,
                  })
                }
                disabled={isPending}
              >
                {userReaction === ReactionType.DISLIKE ? (
                  <ThumbDownIcon fontSize='small' />
                ) : (
                  <ThumbDownOffAltIcon fontSize='small' />
                )}
              </IconButton>
            </Box>

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
