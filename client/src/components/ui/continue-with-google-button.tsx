'use client';

import { auth, googleProvider } from '@/config/firebase.config';
import { useAuth } from '@/context/auth.context';
import { useSigninWithGoogleMutation } from '@/hooks/auth.hook';
import { SigninWithGoogleResponse } from '@/types';
import GoogleIcon from '@mui/icons-material/Google';
import Button from '@mui/material/Button';
import { signInWithPopup } from 'firebase/auth';
import { toast } from 'sonner';

type ContinueWithGoogleButtonProps = {
  fullWidth?: boolean;
};

export default function ContinueWithGoogleButton({
  fullWidth = true,
}: ContinueWithGoogleButtonProps) {
  const { signin } = useAuth();
  const { mutate: signinWithGoogle, isPending: isSigningInWithGoogle } =
    useSigninWithGoogleMutation();

  const handleGoogleSignIn = async () => {
    const credential = await signInWithPopup(auth, googleProvider);
    const token = await credential.user.getIdToken();

    if (!token) {
      toast.error('Failed to signin with Google');
      return;
    }

    signinWithGoogle(token, {
      onSuccess: (response: SigninWithGoogleResponse) => {
        if (!('user' in response) || !response.user) {
          toast.error(response.message);
          return;
        }
        signin({ user: response.user, token });
      },
    });
  };

  return (
    <Button
      variant='outlined'
      fullWidth={fullWidth}
      disabled={isSigningInWithGoogle}
      onClick={handleGoogleSignIn}
      startIcon={<GoogleIcon />}
      sx={{
        textTransform: 'none',
        py: 1.25,
        borderColor: 'divider',
        color: 'text.primary',
        '&:hover': {
          borderColor: 'text.secondary',
          backgroundColor: 'action.hover',
        },
      }}
    >
      Continue with Google
    </Button>
  );
}
