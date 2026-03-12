import PostForm from '@/components/posts/post-form';
import { Typography } from '@mui/material';

async function fetchPostIds(): Promise<{ id: string }[]> {
  const base =
    process.env.NEXT_PUBLIC_API_URL ||
    'http://127.0.0.1:5001/fir-twitter-clone-ec0b2/us-central1/api';
  const apiBase = base.replace(/\/$/, '');
  const ids: { id: string }[] = [];
  let cursor: string | null = null;

  try {
    do {
      const url = cursor
        ? `${apiBase}/post?limit=50&cursor=${encodeURIComponent(cursor)}`
        : `${apiBase}/post?limit=50`;
      const res = await fetch(url);
      if (!res.ok) break;
      const data = (await res.json()) as { items?: { id: string }[]; nextCursor?: string | null };
      const items = data.items ?? [];
      ids.push(...items.map((p) => ({ id: p.id })));
      cursor = data.nextCursor ?? null;
    } while (cursor);
  } catch {
    // API may be unreachable at build time – return whatever we have
  }

  return ids;
}

export async function generateStaticParams() {
  return fetchPostIds();
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
