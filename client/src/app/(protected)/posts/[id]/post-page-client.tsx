'use client';

import PostPage from '@/components/posts/post-page';
import { usePathname } from 'next/navigation';

export default function PostPageClient() {
  const pathname = usePathname();
  // Read id from URL - useParams() returns '__' from static export during hydration
  const id = pathname?.split('/').pop() || undefined;

  if (!id || id === 'posts') return null;
  return <PostPage postId={id} />;
}
