'use client';

import Link from '@/components/link';
import { useCheckAndSendPasswordResetEmailMutation } from '@/hooks/auth.hook';
import {
  type ForgotPasswordInput,
  forgotPasswordSchema,
} from '@/schemas/auth.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

export default function ForgotPasswordForm() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const {
    mutate: checkAndSendPasswordResetEmail,
    isPending: isCheckingEmailForPasswordReset,
  } = useCheckAndSendPasswordResetEmailMutation();

  const isLoading = isCheckingEmailForPasswordReset;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    setErrorMessage(null);
    setSuccessMessage(null);

    checkAndSendPasswordResetEmail(data.email, {
      onSuccess: () => {
        setSuccessMessage(
          'Check your email for a link to reset your password.',
        );
      },
      onError: (error) => {
        const message =
          error instanceof Error ? error.message : 'Failed to send reset email';
        setErrorMessage(message);
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
        Forgot password
      </Typography>

      <Typography
        variant='body2'
        color='text.secondary'
        sx={{ mb: 2, textAlign: 'center' }}
      >
        Enter your email and we&apos;ll send you a link to reset your password.
      </Typography>

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

        {errorMessage && (
          <Alert severity='error'>
            {errorMessage.charAt(0).toUpperCase() +
              errorMessage.slice(1).toLowerCase()}
          </Alert>
        )}
        {successMessage && (
          <Alert severity='success'>
            {successMessage.charAt(0).toUpperCase() +
              successMessage.slice(1).toLowerCase()}
          </Alert>
        )}

        <Button
          type='submit'
          variant='contained'
          disabled={isLoading}
          fullWidth
          sx={{ py: 1.25, textTransform: 'none' }}
        >
          {isLoading ? 'Sending...' : 'Send reset link'}
        </Button>
      </Box>

      <Typography
        variant='body2'
        color='text.secondary'
        sx={{ mt: 2, textAlign: 'center' }}
      >
        Remember your password?{' '}
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
