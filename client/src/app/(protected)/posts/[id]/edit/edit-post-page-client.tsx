'use client';

import PostForm from '@/components/posts/post-form';
import { usePathname } from 'next/navigation';

export default function EditPostPageClient() {
  const pathname = usePathname();
  // Read id from URL - useParams() returns '__' from static export during hydration
  // Path: /posts/[id]/edit -> extract id (second segment)
  const segments = pathname?.split('/').filter(Boolean) ?? [];
  const id = segments[1]; // ['posts', id, 'edit'] -> id

  if (!id || id === 'posts') return null;
  return <PostForm postId={id} />;
}
