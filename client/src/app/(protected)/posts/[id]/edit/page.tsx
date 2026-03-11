import PostForm from '@/components/posts/post-form';
import { Typography } from '@mui/material';

export function generateStaticParams() {
  return [];
}

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditPostPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <>
      <Typography variant='h4' sx={{ mb: 4, fontWeight: 500 }}>
        Edit post
      </Typography>
      <PostForm postId={id} />
    </>
  );
}
