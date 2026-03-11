'use client';

import { auth } from '@/config/firebase.config';
import { PAGES } from '@/config/pages.config';
import { useChangePasswordMutation } from '@/hooks/settings.hook';
import {
  ChangePasswordFormData,
  changePasswordSchema,
} from '@/schemas/settings.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  TextField,
  Typography,
} from '@mui/material';
import { onAuthStateChanged } from 'firebase/auth';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

export default function ChangePassword() {
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [hasPasswordProvider, setHasPasswordProvider] = useState<
    boolean | null
  >(null);

  const { mutate: changePassword, isPending: isChangingPassword } =
    useChangePasswordMutation();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setHasPasswordProvider(
        u?.providerData?.some((p) => p.providerId === 'password') ?? false,
      );
    });
    return () => unsub();
  }, []);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  function onPasswordSubmit(data: ChangePasswordFormData) {
    setPasswordError(null);
    setPasswordSuccess(null);
    changePassword(data, {
      onSuccess: () => {
        setPasswordSuccess('Password changed successfully');
        reset();
      },
      onError: (error) => {
        const err = error as { code?: string };
        if (
          err.code === 'auth/wrong-password' ||
          err.code === 'auth/invalid-credential'
        ) {
          setPasswordError('Current password is incorrect');
        } else {
          setPasswordError(
            error instanceof Error
              ? error.message
              : 'Failed to change password',
          );
        }
      },
    });
  }

  return (
    <>
      {hasPasswordProvider === true && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant='h6' sx={{ mb: 2 }}>
              Change password
            </Typography>
            <Box
              component='form'
              onSubmit={handleSubmit(onPasswordSubmit)}
              sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
            >
              <TextField
                {...register('currentPassword')}
                label='Current password'
                type='password'
                error={!!errors.currentPassword}
                helperText={errors.currentPassword?.message}
                fullWidth
                size='small'
              />
              <TextField
                {...register('newPassword')}
                label='New password'
                type='password'
                error={!!errors.newPassword}
                helperText={errors.newPassword?.message}
                fullWidth
                size='small'
              />
              <TextField
                {...register('confirmPassword')}
                label='Confirm new password'
                type='password'
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword?.message}
                fullWidth
                size='small'
              />
              {passwordError && (
                <Alert severity='error'>
                  {passwordError.charAt(0).toUpperCase() +
                    passwordError.slice(1).toLowerCase()}
                </Alert>
              )}
              {passwordSuccess && (
                <Alert severity='success'>
                  {passwordSuccess.charAt(0).toUpperCase() +
                    passwordSuccess.slice(1).toLowerCase()}
                </Alert>
              )}
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  type='submit'
                  variant='contained'
                  disabled={isChangingPassword}
                  sx={{ textTransform: 'none' }}
                >
                  {isChangingPassword ? (
                    <CircularProgress size={24} />
                  ) : (
                    'Change password'
                  )}
                </Button>
                <Link
                  href={PAGES.FORGOT_PASSWORD}
                  style={{ alignSelf: 'center', fontSize: '0.875rem' }}
                >
                  Forgot password?
                </Link>
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}
      {!hasPasswordProvider && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant='h6' sx={{ mb: 2 }}>
              Change password
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              You signed in with Google. Use your Google account to manage your
              password.
            </Typography>
          </CardContent>
        </Card>
      )}
    </>
  );
}
