'use client';

import { PAGES } from '@/config/pages.config';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace(PAGES.FEED);
  }, [router]);

  return null;
}
