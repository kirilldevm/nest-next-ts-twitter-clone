'use client';

import Link from '@/components/link';
import ContinueWithGoogleButton from '@/components/ui/continue-with-google-button';
import { useSignupMutation } from '@/hooks/auth.hook';
import { type SignupInput, signupSchema } from '@/schemas/auth.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import DeleteIcon from '@mui/icons-material/Delete';
import { Alert, Avatar, IconButton, Input, Stack } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useEffect, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

export default function RegisterForm() {
  const { mutate: signup, isPending: isSigningUp } = useSignupMutation();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const isLoading = isSigningUp;

  const {
    control,
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      profileImage: undefined,
    },
  });

  const onSubmit = (data: SignupInput) => {
    setErrorMessage(null);
    setSuccessMessage(null);

    signup(data, {
      onSuccess: (response) => {
        if ('message' in response) setSuccessMessage(response.message);
        reset();
      },
      onError: (error) => {
        const message =
          error instanceof Error ? error.message : 'An unknown error occurred';
        setErrorMessage(message);
      },
    });
  };

  const image = watch('profileImage');
  const hasError = !!errorMessage || Object.keys(errors).length > 0;

  useEffect(() => {
    if (image) {
      setImagePreview(URL.createObjectURL(image));
    } else {
      setImagePreview(null);
    }
  }, [image]);

  function handleClearPhoto() {
    setValue('profileImage', undefined);
    if (photoInputRef.current) {
      photoInputRef.current.value = '';
    }
    setImagePreview(null);
  }

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
        Create account
      </Typography>

      <ContinueWithGoogleButton fullWidth />

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
          {...register('lastName')}
          label='Last name'
          error={!!errors.lastName}
          helperText={errors.lastName?.message}
          fullWidth
          autoComplete='family-name'
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

        <Stack direction='column' gap={1}>
          <Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>
            Profile image (optional)
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {imagePreview ? (
              <Avatar
                src={imagePreview}
                alt='Profile image'
                sx={{ width: 80, height: 80 }}
              />
            ) : (
              <Avatar
                sx={{ width: 80, height: 80 }}
                src='user-200.png'
                alt='No user image'
              />
            )}
            <Controller
              name='profileImage'
              control={control}
              render={({ field: { onChange, ref } }) => (
                <Input
                  inputRef={(el) => {
                    ref(el);
                    photoInputRef.current = el;
                  }}
                  type='file'
                  endAdornment={
                    imagePreview && (
                      <IconButton onClick={handleClearPhoto}>
                        <DeleteIcon sx={{ color: 'error.main' }} />
                      </IconButton>
                    )
                  }
                  inputProps={{
                    accept: 'image/jpeg,image/png,image/webp,image/gif',
                  }}
                  disableUnderline
                  sx={{ fontSize: '0.875rem' }}
                  fullWidth
                  onChange={(e) => {
                    const file = (e.target as HTMLInputElement).files?.[0];
                    onChange(file ?? undefined);
                  }}
                />
              )}
            />
            {errors.profileImage && (
              <Alert severity='error'>{errors.profileImage.message}</Alert>
            )}
          </Box>
        </Stack>

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
          {isLoading ? 'Creating account...' : 'Create account'}
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
