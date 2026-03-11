import PostForm from '@/components/posts/post-form';
import { Typography } from '@mui/material';

export default function CreatePostPage() {
  return (
    <>
      <Typography variant='h4' sx={{ mb: 4, fontWeight: 500 }}>
        Create post
      </Typography>
      <PostForm />
    </>
  );
}
