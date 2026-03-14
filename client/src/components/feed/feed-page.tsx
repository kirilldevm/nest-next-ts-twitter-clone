'use client';

import FeedPostCard, {
  FeedPostCardSkeleton,
} from '@/components/feed/feed-post-card';
import { useFeedPosts } from '@/hooks/feed.hook';
import SearchIcon from '@mui/icons-material/Search';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
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
    searchQuery,
    setSearchQuery,
    totalHits,
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
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, flexWrap: 'wrap' }}>
        <Typography variant='h5' sx={{ fontWeight: 600 }}>
          Feed
        </Typography>
        <TextField
          placeholder='Search posts by text...'
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          size='small'
          sx={{ maxWidth: 320, minWidth: 200 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position='start'>
                <SearchIcon color='action' />
              </InputAdornment>
            ),
          }}
        />
        {totalHits !== undefined && (
          <Typography variant='body2' color='text.secondary'>
            {totalHits} result{totalHits !== 1 ? 's' : ''}
          </Typography>
        )}
      </Box>

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
            {searchQuery.trim()
              ? 'No posts match your search.'
              : 'No posts yet. Create your first post!'}
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
