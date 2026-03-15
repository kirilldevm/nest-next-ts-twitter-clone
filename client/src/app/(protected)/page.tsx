'use client';

import { PAGES } from '@/config/pages.config';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  router.push(PAGES.FEED);

  return null;
}
