'use client';

import Link from '@/components/link';
import ContinueWithGoogleButton from '@/components/ui/continue-with-google-button';
import { auth, googleProvider } from '@/config/firebase.config';
import { SignupInput, signupSchema } from '@/schemas/auth.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import {
  createUserWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
} from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

export default function RegisterForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupInput) => {
    setLoading(true);
    setError(null);
    try {
      const credential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password,
      );
      await updateProfile(credential.user, {
        displayName: `${data.firstName} ${data.lastName}`,
      });
      router.push('/');
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : 'Something went wrong. Try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithPopup(auth, googleProvider);
      router.push('/');
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : 'Something went wrong. Try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      component='form'
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        border: '1px solid',
        borderColor: 'divider',
        p: 2,
        minWidth: 400,
      }}
    >
      <Typography variant='h5' component='h1' sx={{ mb: 3, fontWeight: 500 }}>
        Create account
      </Typography>

      <ContinueWithGoogleButton
        onClick={handleGoogleSignUp}
        disabled={loading}
        fullWidth
      />

      <Divider sx={{ my: 2, '&::before, &::after': { top: '50%' } }}>
        <Typography variant='caption' color='text.secondary'>
          or
        </Typography>
      </Divider>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          {...register('firstName')}
          label='First name'
          error={!!errors.firstName}
          helperText={errors.firstName?.message}
          fullWidth
          autoComplete='name'
          size='small'
          variant='outlined'
        />
        <TextField
          {...register('email')}
          label='Email'
          type='email'
          error={!!errors.email}
          helperText={errors.email?.message}
          fullWidth
          autoComplete='email'
          size='small'
          variant='outlined'
        />
        <TextField
          {...register('password')}
          label='Password'
          type='password'
          error={!!errors.password}
          helperText={errors.password?.message}
          fullWidth
          autoComplete='new-password'
          size='small'
          variant='outlined'
        />
        <TextField
          {...register('confirmPassword')}
          label='Confirm password'
          type='password'
          error={!!errors.confirmPassword}
          helperText={errors.confirmPassword?.message}
          fullWidth
          autoComplete='new-password'
          size='small'
          variant='outlined'
        />

        {error && (
          <Typography variant='caption' color='error'>
            {error}
          </Typography>
        )}

        <Button
          type='submit'
          variant='contained'
          disabled={loading}
          fullWidth
          sx={{ py: 1.25, textTransform: 'none' }}
        >
          Create account
        </Button>
      </Box>

      <Typography
        variant='body2'
        color='text.secondary'
        sx={{ mt: 2, textAlign: 'center' }}
      >
        Already have an account?{' '}
        <Link
          href='/signin'
          style={{ color: 'inherit', textDecoration: 'underline' }}
        >
          Sign in
        </Link>
      </Typography>
    </Box>
  );
}
