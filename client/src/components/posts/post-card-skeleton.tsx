import { Box, Skeleton } from '@mui/material';

export function PostCardSkeleton() {
  return (
    <Box
      sx={{
        display: 'flex',
        gap: 2,
        py: 2,
        px: { xs: 2, sm: 0 },
        borderBottom: 1,
        borderColor: 'divider',
      }}
    >
      <Skeleton variant='circular' width={40} height={40} />
      <Box sx={{ flex: 1 }}>
        <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
          <Skeleton variant='text' width={100} height={20} />
          <Skeleton variant='text' width={40} height={16} />
        </Box>
        <Skeleton variant='text' width='90%' height={24} />
        <Skeleton variant='text' width='70%' height={20} />
        <Skeleton variant='text' width='50%' height={20} sx={{ mt: 0.5 }} />
      </Box>
    </Box>
  );
}
