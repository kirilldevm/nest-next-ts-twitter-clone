'use client';

import { useReaction, useSetReactionMutation } from '@/hooks/reaction.hook';
import {
  ReactionTargetType,
  ReactionType,
} from '@/types/reaction.type';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import ThumbDownOffAltIcon from '@mui/icons-material/ThumbDownOffAlt';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { useMemo } from 'react';

type ReactionButtonsProps = {
  targetType: ReactionTargetType;
  targetId: string;
  likesCount: number;
  dislikesCount: number;
};

export default function ReactionButtons({
  targetType,
  targetId,
  likesCount,
  dislikesCount,
}: ReactionButtonsProps) {
  const { data: userReaction } = useReaction(targetType, targetId);
  const { mutate: setReaction, isPending } = useSetReactionMutation();

  const accumulatedCount = useMemo(
    () => (likesCount ?? 0) - (dislikesCount ?? 0),
    [likesCount, dislikesCount],
  );

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <IconButton
          size='small'
          sx={{
            color:
              userReaction === ReactionType.LIKE ? 'error.main' : 'text.secondary',
            p: 0.5,
          }}
          onClick={() =>
            setReaction({
              targetId,
              targetType,
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

      {accumulatedCount !== 0 && (
        <Typography variant='caption' color='text.secondary'>
          {accumulatedCount}
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
              targetId,
              targetType,
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
    </Box>
  );
}
