'use client';

import Link from '@/components/link';
import ContinueWithGoogleButton from '@/components/ui/continue-with-google-button';
import { auth, googleProvider } from '@/config/firebase.config';
import {
  useSigninWithGoogleMutation,
  useSignupMutation,
} from '@/hooks/auth.hook';
import { type SignupInput, signupSchema } from '@/schemas/auth.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { signInWithPopup } from 'firebase/auth';
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form';

export default function RegisterForm() {
  const { mutate: signup, isPending: isSigningUp } = useSignupMutation();
  const { mutate: signinWithGoogle, isPending: isSigningInWithGoogle } =
    useSigninWithGoogleMutation();
  const isLoading = isSigningUp || isSigningInWithGoogle;

  const {
    register,
    handleSubmit,
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
    } as SignupInput,
  });

  const onSubmit = (data: SignupInput) => {
    console.log(data);
    signup(data);
  };

  const handleGoogleSignUp = async () => {
    const credential = await signInWithPopup(auth, googleProvider);
    const token = await credential.user.getIdToken();
    console.log(token);
    if (!token) {
      throw new Error('Failed to signin with Google');
    }
    signinWithGoogle(token);
  };

  return (
    <Box
      component='form'
      onSubmit={handleSubmit(onSubmit as SubmitHandler<FieldValues>)}
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
        disabled={isLoading}
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

        <Box>
          <Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>
            Profile image (optional)
          </Typography>
          <Input
            {...register('profileImage')}
            type='file'
            inputProps={{
              accept: 'image/jpeg,image/png,image/webp,image/gif',
            }}
            disableUnderline
            sx={{ fontSize: '0.875rem' }}
            fullWidth
          />
        </Box>
        {errors.profileImage && (
          <Typography variant='caption' color='error'>
            {errors.profileImage.message}
          </Typography>
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
