'use client';

import CommentForm from '@/components/comments/comment-form';
import ReactionButtons from '@/components/reactions/reaction-buttons';
import { useAuth } from '@/context/auth.context';
import { formatRelativeTime } from '@/helpers';
import {
  useComments,
  useDeleteCommentMutation,
  useUpdateCommentMutation,
} from '@/hooks/comment.hook';
import type { Comment } from '@/types/comment.type';
import { ReactionTargetType } from '@/types/reaction.type';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditIcon from '@mui/icons-material/Edit';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { useState } from 'react';

type CommentItemProps = {
  comment: Comment;
  postId: string;
  depth?: number;
};

export default function CommentItem({
  comment,
  postId,
  depth = 0,
}: CommentItemProps) {
  const { user } = useAuth();
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [showReplies, setShowReplies] = useState(false);

  const isCreator = !!user && comment.authorId === user.id;
  const { data: repliesData, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useComments(postId, comment.id, { enabled: showReplies });
  const replies = repliesData?.pages.flatMap((p) => p.items) ?? [];
  const replyCount = comment.replyCount ?? 0;
  const hasReplies = replyCount > 0;

  const { mutate: updateComment } = useUpdateCommentMutation(postId);
  const { mutate: deleteComment, isPending: isDeleting } =
    useDeleteCommentMutation(postId);

  function handleSaveEdit() {
    const trimmed = editContent.trim();
    if (trimmed && trimmed !== comment.content) {
      updateComment(
        { id: comment.id, content: trimmed },
        { onSuccess: () => setIsEditing(false) },
      );
    } else {
      setIsEditing(false);
    }
  }

  const avatarLetter = comment.authorDisplayName[0]?.toUpperCase() ?? '?';
  const maxDepth = 4;
  const indent = Math.min(depth, maxDepth) * 2;

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 1.5,
        py: 1.5,
        pl: indent,
        borderLeft: depth > 0 ? 1 : 0,
        borderColor: 'divider',
        ml: depth > 0 ? 2 : 0,
      }}
    >
      <Avatar
        src={comment.authorPhotoURL ?? undefined}
        alt={comment.authorDisplayName}
        sx={{ width: 32, height: 32, flexShrink: 0 }}
      >
        {avatarLetter}
      </Avatar>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            flexWrap: 'wrap',
            mb: 0.25,
          }}
        >
          <Typography variant='subtitle2' fontWeight={600}>
            {comment.authorDisplayName}
          </Typography>
          <Typography variant='caption' color='text.secondary'>
            · {formatRelativeTime(comment.createdAt)}
          </Typography>
          {isCreator && !comment.isDeleted && (
            <Box sx={{ display: 'flex', gap: 0.25, ml: 'auto' }}>
              <IconButton
                size='small'
                sx={{ p: 0.25 }}
                onClick={() => {
                  setIsEditing(true);
                  setEditContent(comment.content);
                }}
                disabled={isDeleting}
              >
                <EditIcon sx={{ fontSize: 14 }} />
              </IconButton>
              <IconButton
                size='small'
                sx={{ p: 0.25 }}
                onClick={() => deleteComment(comment.id)}
                disabled={isDeleting}
              >
                <DeleteOutlineIcon sx={{ fontSize: 14 }} />
              </IconButton>
            </Box>
          )}
        </Box>

        {isEditing ? (
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mt: 0.5 }}>
            <Box
              component='textarea'
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              sx={{
                flex: 1,
                p: 1,
                borderRadius: 1,
                border: 1,
                borderColor: 'divider',
                fontFamily: 'inherit',
                fontSize: 14,
                resize: 'vertical',
                minHeight: 60,
              }}
            />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <Button
                size='small'
                variant='contained'
                onClick={handleSaveEdit}
                sx={{ textTransform: 'none', minWidth: 60 }}
              >
                Save
              </Button>
              <Button
                size='small'
                variant='outlined'
                onClick={() => {
                  setIsEditing(false);
                  setEditContent(comment.content);
                }}
                sx={{ textTransform: 'none', minWidth: 60 }}
              >
                Cancel
              </Button>
            </Box>
          </Box>
        ) : (
          <Typography
            variant='body2'
            color={comment.isDeleted ? 'text.secondary' : 'text.primary'}
            sx={{ fontStyle: comment.isDeleted ? 'italic' : undefined }}
          >
            {comment.isDeleted ? '[deleted]' : comment.content}
          </Typography>
        )}

        {!comment.isDeleted && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              mt: 1,
              flexWrap: 'wrap',
            }}
          >
            <ReactionButtons
              targetType={ReactionTargetType.COMMENT}
              targetId={comment.id}
              likesCount={comment.likesCount ?? 0}
              dislikesCount={comment.dislikesCount ?? 0}
            />

            <IconButton
              size='small'
              sx={{
                color: 'text.secondary',
                p: 0.5,
                '&:hover': { color: 'primary.main' },
              }}
              onClick={() => setIsReplying(!isReplying)}
            >
              <ChatBubbleOutlineIcon sx={{ fontSize: 18 }} />
            </IconButton>
            <Typography variant='caption' color='text.secondary'>
              Reply
            </Typography>
          </Box>
        )}

        {isReplying && (
          <Box sx={{ mt: 1.5 }}>
            <CommentForm
              postId={postId}
              parentId={comment.id}
              placeholder={`Reply to ${comment.authorDisplayName}...`}
              onSuccess={() => setIsReplying(false)}
            />
          </Box>
        )}

        {hasReplies && (
          <Box sx={{ mt: 1.5 }}>
            {!showReplies ? (
              <Typography
                component='button'
                variant='caption'
                color='primary'
                onClick={() => setShowReplies(true)}
                sx={{
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  '&:hover': { textDecoration: 'underline' },
                }}
              >
                View {replyCount} {replyCount === 1 ? 'reply' : 'replies'}
              </Typography>
            ) : (
              <>
                {replies.map((reply) => (
                  <CommentItem
                    key={reply.id}
                    comment={reply}
                    postId={postId}
                    depth={depth + 1}
                  />
                ))}
                {hasNextPage && (
                  <Box sx={{ pl: indent + 2, mt: 1 }}>
                    <Typography
                      component='button'
                      variant='caption'
                      color='primary'
                      onClick={() => fetchNextPage()}
                      disabled={isFetchingNextPage}
                      sx={{
                        border: 'none',
                        background: 'none',
                        cursor: 'pointer',
                        '&:hover': { textDecoration: 'underline' },
                      }}
                    >
                      {isFetchingNextPage
                        ? 'Loading...'
                        : `View ${replyCount - replies.length} more replies`}
                    </Typography>
                  </Box>
                )}
              </>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
}
