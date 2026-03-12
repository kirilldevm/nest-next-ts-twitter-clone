'use client';

import FeedPostCard, {
  FeedPostCardSkeleton,
} from '@/components/feed/feed-post-card';
import { useFeedPosts } from '@/hooks/feed.hook';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

export default function FeedPage() {
  const {
    posts,
    isLoading,
    isError,
    error,
    currentPage,
    hasNextPage,
    hasPrevPage,
    nextPage,
    prevPage,
  } = useFeedPosts();

  if (isError) {
    return (
      <Box sx={{ py: 4, textAlign: 'center' }}>
        <Typography color='error'>
          {error?.message ?? 'Failed to load feed'}
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant='h5' sx={{ fontWeight: 600, mb: 2 }}>
        Feed
      </Typography>

      {isLoading ? (
        <Box>
          {Array.from({ length: 5 }).map((_, i) => (
            <FeedPostCardSkeleton key={i} />
          ))}
        </Box>
      ) : posts.length === 0 ? (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 200,
          }}
        >
          <Typography variant='body2' color='text.secondary'>
            No posts yet. Create your first post!
          </Typography>
        </Box>
      ) : (
        <>
          <Box sx={{ borderTop: 1, borderColor: 'divider' }}>
            {posts.map((post) => (
              <FeedPostCard key={post.id} post={post} />
            ))}
          </Box>

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mt: 3,
              pt: 2,
              borderTop: 1,
              borderColor: 'divider',
            }}
          >
            <Button
              variant='outlined'
              size='small'
              startIcon={<ChevronLeftIcon />}
              onClick={prevPage}
              disabled={!hasPrevPage}
              sx={{ textTransform: 'none' }}
            >
              Previous
            </Button>
            <Typography variant='body2' color='text.secondary'>
              Page {currentPage}
            </Typography>
            <Button
              variant='outlined'
              size='small'
              endIcon={<ChevronRightIcon />}
              onClick={nextPage}
              disabled={!hasNextPage}
              sx={{ textTransform: 'none' }}
            >
              Next
            </Button>
          </Box>
        </>
      )}
    </Box>
  );
}
