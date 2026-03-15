'use client';

import Link from '@/components/link';
import ContinueWithGoogleButton from '@/components/ui/continue-with-google-button';
import {
  useResendVerificationEmailMutation,
  useSigninMutation,
} from '@/hooks/auth.hook';
import { type SigninInput, signinSchema } from '@/schemas/auth.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

export default function LoginForm() {
  const { mutate: signin, isPending: isSigningIn } = useSigninMutation();
  const { mutate: resendVerification, isPending: isResending } =
    useResendVerificationEmailMutation();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);
  const [resendSuccess, setResendSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SigninInput>({
    resolver: zodResolver(signinSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = (data: SigninInput) => {
    setErrorMessage(null);
    setUnverifiedEmail(null);
    setResendSuccess(false);

    signin(data, {
      onError: (error, variables) => {
        const message =
          error instanceof Error ? error.message : 'An unknown error occurred';
        setErrorMessage(message);
        if (
          message.toLowerCase().includes('verify your email') &&
          variables?.email
        ) {
          setUnverifiedEmail(variables.email);
        } else {
          setUnverifiedEmail(null);
        }
      },
    });
  };

  const handleResendVerification = () => {
    if (!unverifiedEmail) return;
    setResendSuccess(false);
    setErrorMessage(null);
    resendVerification(unverifiedEmail, {
      onSuccess: () => {
        setResendSuccess(true);
        setErrorMessage(null);
      },
      onError: (error) => {
        setErrorMessage(
          error instanceof Error ? error.message : 'Failed to resend email',
        );
      },
    });
  };

  const hasError = !!errorMessage || Object.keys(errors).length > 0;

  return (
    <Box
      component='form'
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 0.5,
        border: '1px solid',
        borderColor: hasError ? 'error.main' : 'divider',
        py: 4,
        px: 2,
        minWidth: 400,
      }}
    >
      <Typography
        variant='h5'
        component='h1'
        sx={{
          mb: 3,
          fontWeight: 500,
          textAlign: 'center',
        }}
      >
        Sign in
      </Typography>

      <ContinueWithGoogleButton fullWidth />

      <Divider sx={{ my: 2, '&::before, &::after': { top: '50%' } }}>
        <Typography variant='caption' color='text.secondary'>
          or
        </Typography>
      </Divider>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
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
          autoComplete='current-password'
          size='small'
          variant='outlined'
        />
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Link
            href='/reset-password'
            style={{
              fontSize: '0.875rem',
              color: 'inherit',
              textDecoration: 'underline',
            }}
          >
            Forgot password?
          </Link>
        </Box>

        {errorMessage && (
          <Alert severity='error'>
            {errorMessage.charAt(0).toUpperCase() +
              errorMessage.slice(1).toLowerCase()}
            {unverifiedEmail && (
              <Box component='span' sx={{ display: 'block', mt: 1 }}>
                <Button
                  size='small'
                  variant='text'
                  onClick={handleResendVerification}
                  disabled={isResending}
                  sx={{ textTransform: 'none', px: 0, minWidth: 0 }}
                >
                  {isResending ? 'Sending...' : 'Resend verification email'}
                </Button>
              </Box>
            )}
          </Alert>
        )}
        {resendSuccess && (
          <Alert severity='success'>
            Verification email sent. Please check your inbox.
          </Alert>
        )}

        <Button
          type='submit'
          variant='contained'
          disabled={isSigningIn}
          fullWidth
          sx={{ py: 1.25, textTransform: 'none' }}
        >
          {isSigningIn ? 'Signing in...' : 'Sign in'}
        </Button>
      </Box>

      <Typography
        variant='body2'
        color='text.secondary'
        sx={{ mt: 2, textAlign: 'center' }}
      >
        Don&apos;t have an account?{' '}
        <Link
          href='/signup'
          style={{ color: 'inherit', textDecoration: 'underline' }}
        >
          Create account
        </Link>
      </Typography>
    </Box>
  );
}
