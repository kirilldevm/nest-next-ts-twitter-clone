'use client';

import ProfilePage from '@/components/profile/profile-page';
import { usePathname } from 'next/navigation';

export default function ProfilePageClient() {
  const pathname = usePathname();
  // Read id from URL - useParams() returns '__' from static export during hydration
  const id = pathname?.split('/').pop() || undefined;

  if (!id || id === 'profile') return null;
  return <ProfilePage userId={id} />;
}
