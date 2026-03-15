import PostPage from '@/components/posts/post-page';
import PostPageClient from './post-page-client';

// Placeholder for static export; client reads real id from URL via useParams
export async function generateStaticParams() {
  return [{ id: '__' }];
}

export default function PostViewRoute() {
  return <PostPageClient />;
}
