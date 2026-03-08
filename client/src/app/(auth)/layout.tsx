'use client';

import { DEFAULT_LOGIN_REDIRECT } from '@/config/routes.config';
import { useAuth } from '@/context/auth.context';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { useRouter } from 'next/navigation';
import { type ReactNode, useEffect, useState } from 'react';

export default function AuthLayout({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    if (!mounted || loading) return;

    if (user) {
      router.replace(DEFAULT_LOGIN_REDIRECT);
    }
  }, [mounted, user, loading, router]);

  // Avoid hydration mismatch: auth state differs on server vs client (Firebase resolves from cache)
  if (!mounted) {
    return (
      <Box
        sx={{
          display: 'flex',
          minHeight: '100vh',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress size={32} />
      </Box>
    );
  }

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          minHeight: '100vh',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress size={32} />
      </Box>
    );
  }

  if (user) {
    return null; // Redirecting
  }

  return <>{children}</>;
}
