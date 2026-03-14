'use client';

import CommentList from '@/components/comments/comment-list';
import Link from '@/components/link';
import PostCard from '@/components/posts/post-card';
import { PAGES } from '@/config/pages.config';
import { useAuth } from '@/context/auth.context';
import { getDisplayName } from '@/helpers';
import { useDeletePostMutation, usePost } from '@/hooks/post.hook';
import { useUser } from '@/hooks/user.hook';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { CircularProgress, Stack } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { useRouter } from 'next/navigation';
import PostPageSkeleton from './post-page-skeleton';

type PostPageProps = {
  postId: string;
};

export default function PostPage({ postId }: PostPageProps) {
  const { user: authUser } = useAuth();
  const router = useRouter();

  const { data: post, isLoading, isError, error } = usePost(postId);
  const { data: author, isLoading: isLoadingAuthor } = useUser(
    post?.authorId ?? undefined,
  );
  const { mutate: deletePost, isPending: isDeletingPost } =
    useDeletePostMutation();

  function handleDeletePost() {
    deletePost(postId, {
      onSuccess: () => {
        router.push(PAGES.FEED);
      },
    });
  }
  const isCreator = !!authUser && !!post && post.authorId === authUser.id;

  if (isLoading) {
    return <PostPageSkeleton />;
  }

  if (isError) {
    return (
      <Box sx={{ py: 4, textAlign: 'center' }}>
        <Typography color='error'>
          {error instanceof Error ? error.message : 'Failed to load post'}
        </Typography>
      </Box>
    );
  }

  if (!post) {
    return (
      <Box sx={{ py: 4, textAlign: 'center' }}>
        <Typography color='text.secondary'>Post not found</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
          mb: 3,
        }}
      >
        <Link
          href={PAGES.FEED}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            color: 'inherit',
            textDecoration: 'none',
          }}
        >
          <ArrowBackIcon
            fontSize='small'
            sx={{ '&:hover': { textDecoration: 'underline' } }}
          />
          <Typography
            variant='body2'
            sx={{ '&:hover': { textDecoration: 'underline' } }}
          >
            Back
          </Typography>
        </Link>

        {isCreator && (
          <Stack direction='row' gap={2}>
            <Link
              href={PAGES.POST_EDIT(postId)}
              style={{ textDecoration: 'none' }}
            >
              <Button
                variant='outlined'
                size='small'
                sx={{ textTransform: 'none' }}
                disabled={isDeletingPost}
              >
                Edit
              </Button>
            </Link>

            <Button
              variant='contained'
              color='error'
              size='small'
              sx={{ textTransform: 'none' }}
              onClick={() => handleDeletePost()}
              disabled={isDeletingPost}
            >
              {isDeletingPost ? <CircularProgress size={24} /> : 'Delete'}
            </Button>
          </Stack>
        )}
      </Box>

      {isLoadingAuthor ? (
        <PostPageSkeleton />
      ) : (
        <PostCard
          post={post}
          author={
            author
              ? {
                  displayName: getDisplayName(author),
                  photoURL: author.photoURL,
                }
              : { displayName: 'Unknown', photoURL: null }
          }
          variant='detail'
        />
      )}

      <Box sx={{ mt: 4, pt: 3, borderTop: 1, borderColor: 'divider' }}>
        <Typography
          variant='caption'
          sx={{
            display: 'block',
            color: 'text.secondary',
            fontWeight: 600,
            mb: 2,
          }}
        >
          COMMENTS
        </Typography>
        <CommentList postId={postId} />
      </Box>
    </Box>
  );
}
