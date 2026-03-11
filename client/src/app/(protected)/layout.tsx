'use client';

import Header from '@/components/ui/header';
import { authRoutes } from '@/config/routes.config';
import { useAuth } from '@/context/auth.context';
import { Container } from '@mui/material';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      const loginPath = authRoutes[0]; // PAGES.LOGIN
      router.replace(`${loginPath}?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [user, loading, router, pathname]);

  if (loading) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <div className='h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent' />
      </div>
    );
  }

  if (!user) {
    return null; // Redirecting
  }

  return (
    <>
      <Header />
      <Container maxWidth='md' component='main' sx={{ py: 4 }}>
        {children}
      </Container>
    </>
  );
}
