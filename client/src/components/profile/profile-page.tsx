'use client';

import Link from '@/components/link';
import PostCard from '@/components/posts/post-card';
import { PostCardSkeleton } from '@/components/posts/post-card-skeleton';
import { PAGES } from '@/config/pages.config';
import { useAuth } from '@/context/auth.context';
import { getDisplayName } from '@/helpers';
import { usePosts } from '@/hooks/posts.hook';
import { useSendVerificationEmail, useUser } from '@/hooks/user.hook';
import { Alert } from '@mui/material';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';

type ProfilePageProps = {
  userId?: string;
};

export default function ProfilePage({ userId }: ProfilePageProps) {
  const { mutate: sendVerificationEmail } = useSendVerificationEmail();
  const { user: authUser } = useAuth();
  const isOwnProfile = !userId || userId === authUser?.id;
  const targetUserId = userId ?? authUser?.id;

  const {
    data: user,
    isLoading,
    isError,
    error,
  } = useUser(targetUserId ?? undefined);

  const {
    data: postsData,
    isLoading: isLoadingPosts,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = usePosts({
    authorId: targetUserId ?? undefined,
  });

  if (!targetUserId && !authUser) {
    return null;
  }

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  if (isError) {
    return (
      <Box sx={{ py: 4, textAlign: 'center' }}>
        <Typography color='error'>
          {error instanceof Error ? error.message : 'Failed to load profile'}
        </Typography>
      </Box>
    );
  }

  if (!user) {
    return (
      <Box sx={{ py: 4, textAlign: 'center' }}>
        <Typography color='text.secondary'>User not found</Typography>
      </Box>
    );
  }

  return (
    <Box>
      {isOwnProfile && !user.emailVerified && (
        <Alert severity='info' sx={{ mb: 2 }}>
          Please verify your email to continue.
          <Button
            variant='text'
            color='primary'
            onClick={() => sendVerificationEmail()}
            sx={{ textTransform: 'none' }}
          >
            Send verification email
          </Button>
        </Alert>
      )}

      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'center', sm: 'flex-start' },
          gap: 3,
          py: 4,
          px: { xs: 2, sm: 0 },
        }}
      >
        <Avatar
          src={user.photoURL ?? undefined}
          alt={getDisplayName(user)}
          sx={{ width: 120, height: 120 }}
        >
          {getDisplayName(user)[0].toUpperCase()}
        </Avatar>

        <Box
          sx={{ flex: 1, minWidth: 0, textAlign: { xs: 'center', sm: 'left' } }}
        >
          <Typography variant='h5' sx={{ fontWeight: 600 }}>
            {getDisplayName(user) || 'Unknown'}
          </Typography>

          <Box
            sx={{
              display: 'flex',
              gap: 3,
              my: 2,
              justifyContent: { xs: 'center', sm: 'flex-start' },
            }}
          >
            <Typography variant='body2'>
              <strong>
                {postsData?.pages.flatMap((p) => p.items).length ?? 0}
              </strong>{' '}
              posts
            </Typography>
          </Box>

          {isOwnProfile && (
            <Link href={PAGES.SETTINGS} style={{ textDecoration: 'none' }}>
              <Button
                variant='outlined'
                size='small'
                sx={{ textTransform: 'none' }}
              >
                Edit profile
              </Button>
            </Link>
          )}
        </Box>
      </Box>

      <Divider />

      <Box sx={{ py: 3 }}>
        <Typography
          variant='caption'
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 0.5,
            color: 'text.secondary',
            py: 1,
          }}
        >
          POSTS
        </Typography>

        {isLoadingPosts ? (
          <Box sx={{ mt: 1 }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <PostCardSkeleton key={i} />
            ))}
          </Box>
        ) : (
          <>
            <Box sx={{ mt: 1 }}>
              {postsData?.pages
                .flatMap((p) => p.items)
                .map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    author={{
                      displayName: getDisplayName(user),
                      photoURL: user.photoURL,
                    }}
                  />
                )) ?? null}
            </Box>

            {hasNextPage && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <Button
                  variant='outlined'
                  size='small'
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                  sx={{ textTransform: 'none' }}
                >
                  {isFetchingNextPage ? 'Loading...' : 'Load more'}
                </Button>
              </Box>
            )}

            {!isLoadingPosts &&
              (!postsData?.pages.length ||
                postsData.pages.flatMap((p) => p.items).length === 0) && (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: 200,
                  }}
                >
                  <Typography variant='body2' color='text.secondary'>
                    No posts yet
                  </Typography>
                </Box>
              )}
          </>
        )}
      </Box>
    </Box>
  );
}

function ProfileSkeleton() {
  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: 'center',
          gap: 3,
          py: 4,
        }}
      >
        <Skeleton variant='circular' width={120} height={120} />
        <Box sx={{ flex: 1, width: '100%' }}>
          <Skeleton variant='text' width='40%' height={32} />
          <Box sx={{ display: 'flex', gap: 3, mt: 2 }}>
            <Skeleton variant='text' width={60} />
            <Skeleton variant='text' width={60} />
            <Skeleton variant='text' width={60} />
          </Box>
          <Skeleton
            variant='rectangular'
            width={100}
            height={36}
            sx={{ mt: 2 }}
          />
        </Box>
      </Box>
      <Divider />
      <Box sx={{ py: 3 }}>
        <Skeleton variant='text' width={60} sx={{ mx: 'auto' }} />
        <Skeleton variant='rectangular' height={200} sx={{ mt: 2 }} />
      </Box>
    </Box>
  );
}
