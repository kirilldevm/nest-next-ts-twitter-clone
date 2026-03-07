'use client';

import { DEFAULT_LOGIN_REDIRECT } from '@/config/routes.config';
import { useAuth } from '@/context/auth.context';
import { useRouter } from 'next/navigation';
import { type ReactNode, useEffect } from 'react';

export default function AuthLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (user) {
      router.replace(DEFAULT_LOGIN_REDIRECT);
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <div className='h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent' />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
