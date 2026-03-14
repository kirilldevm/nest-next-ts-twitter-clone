'use client';

import CommentForm from '@/components/comments/comment-form';
import CommentItem from '@/components/comments/comment-item';
import { useComments } from '@/hooks/comment.hook';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';

type CommentListProps = {
  postId: string;
};

export default function CommentList({ postId }: CommentListProps) {
  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useComments(postId);

  const comments = data?.pages.flatMap((p) => p.items) ?? [];

  if (isLoading) {
    return (
      <Box sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress size={32} />
      </Box>
    );
  }

  if (isError) {
    return (
      <Box sx={{ py: 2 }}>
        <Typography color='error'>
          {error instanceof Error ? error.message : 'Failed to load comments'}
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <CommentForm postId={postId} placeholder='Write a comment...' />

      <Box sx={{ mt: 3 }}>
        {comments.length === 0 ? (
          <Typography variant='body2' color='text.secondary' sx={{ py: 4 }}>
            No comments yet. Be the first to comment!
          </Typography>
        ) : (
          <>
            {comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                postId={postId}
              />
            ))}
            {hasNextPage && (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                <Button
                  variant='outlined'
                  size='small'
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                  sx={{ textTransform: 'none' }}
                >
                  {isFetchingNextPage ? (
                    <CircularProgress size={20} />
                  ) : (
                    'Load more comments'
                  )}
                </Button>
              </Box>
            )}
          </>
        )}
      </Box>
    </Box>
  );
}
