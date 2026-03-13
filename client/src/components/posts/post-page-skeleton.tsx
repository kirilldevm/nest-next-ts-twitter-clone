import { Box, Skeleton } from '@mui/material';

export default function PostPageSkeleton() {
  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Skeleton variant='rectangular' width={80} height={32} />
        <Skeleton variant='rectangular' width={60} height={32} />
      </Box>
      <Box sx={{ display: 'flex', gap: 2, py: 2 }}>
        <Skeleton variant='circular' width={40} height={40} />
        <Box sx={{ flex: 1 }}>
          <Skeleton variant='text' width='30%' height={24} />
          <Skeleton variant='text' width='90%' height={24} sx={{ mt: 1 }} />
          <Skeleton variant='text' width='70%' height={20} />
        </Box>
      </Box>
    </Box>
  );
}
