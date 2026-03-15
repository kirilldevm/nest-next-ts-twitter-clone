import PostForm from '@/components/posts/post-form';
import { Typography } from '@mui/material';
import EditPostPageClient from './edit-post-page-client';

// Placeholder for static export; client reads real id from URL
export function generateStaticParams() {
  return [{ id: '__' }];
}

export default function EditPostPage() {
  return (
    <>
      <Typography variant='h4' sx={{ mb: 4, fontWeight: 500 }}>
        Edit post
      </Typography>
      <EditPostPageClient />
    </>
  );
}
