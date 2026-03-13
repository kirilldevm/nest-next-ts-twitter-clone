import PostPage from '@/components/posts/post-page';
import { fetchPostIds } from '@/lib/fetch-post-ids';

export async function generateStaticParams() {
  return fetchPostIds();
}

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function PostViewRoute({ params }: PageProps) {
  const { id } = await params;

  return <PostPage postId={id} />;
}
