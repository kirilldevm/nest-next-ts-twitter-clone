'use client';

import { useAuth } from '@/context/auth.context';
import { useCreateCommentMutation } from '@/hooks/comment.hook';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { SubmitEvent, useState } from 'react';

type CommentFormProps = {
  postId: string;
  parentId?: string | null;
  onSuccess?: () => void;
  placeholder?: string;
  autoFocus?: boolean;
};

export default function CommentForm({
  postId,
  parentId = null,
  onSuccess,
  placeholder = 'Write a comment...',
  autoFocus = false,
}: CommentFormProps) {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const { mutate: createComment, isPending } = useCreateCommentMutation(postId);

  function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();

    const trimmed = content.trim();
    if (!trimmed || isPending) return;

    createComment(
      { postId, content: trimmed, parentId },
      {
        onSuccess: () => {
          setContent('');
          onSuccess?.();
        },
      },
    );
  }

  if (!user) {
    return null;
  }

  return (
    <Box component='form' onSubmit={handleSubmit} sx={{ width: '100%' }}>
      <TextField
        fullWidth
        multiline
        minRows={2}
        maxRows={6}
        placeholder={placeholder}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        disabled={isPending}
        autoFocus={autoFocus}
        size='small'
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: 2,
            bgcolor: 'action.hover',
          },
        }}
      />
      <Button
        type='submit'
        variant='contained'
        size='small'
        sx={{ mt: 1, textTransform: 'none' }}
        disabled={!content.trim() || isPending}
      >
        {isPending ? 'Posting...' : 'Reply'}
      </Button>
    </Box>
  );
}
