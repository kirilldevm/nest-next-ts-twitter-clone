'use client';

import { PAGES } from '@/config/pages.config';
import { useAuth } from '@/context/auth.context';
import { useDeleteProfileMutation } from '@/hooks/settings.hook';
import {
  Button,
  Card,
  CardContent,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Typography,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

export default function DeleteProfile() {
  const router = useRouter();
  const { logout } = useAuth();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const { mutate: deleteProfile, isPending: isDeletingProfile } =
    useDeleteProfileMutation();

  function handleDeleteProfile() {
    deleteProfile(undefined, {
      onSuccess: () => {
        logout();
        router.push(PAGES.HOME);
        toast.success('Account deleted');
        setDeleteDialogOpen(false);
      },
      onError: (error) => {
        toast.error(
          error instanceof Error ? error.message : 'Failed to delete account',
        );
      },
    });
  }

  return (
    <>
      <Card sx={{ mb: 3, borderColor: 'error.main' }}>
        <CardContent>
          <Typography variant='h6' sx={{ mb: 1, color: 'error.main' }}>
            Delete account
          </Typography>
          <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
            This action cannot be undone. All your data will be permanently
            removed.
          </Typography>
          <Button
            variant='outlined'
            color='error'
            onClick={() => setDeleteDialogOpen(true)}
            sx={{ textTransform: 'none' }}
          >
            Delete profile
          </Button>
        </CardContent>
      </Card>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => !isDeletingProfile && setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete account?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete your account? This action cannot be
            undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            disabled={isDeletingProfile}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteProfile}
            color='error'
            variant='contained'
            disabled={isDeletingProfile}
          >
            {isDeletingProfile ? <CircularProgress size={24} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
