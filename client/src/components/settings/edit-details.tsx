'use client';

import { useAuth } from '@/context/auth.context';
import { useUpdateProfileMutation } from '@/hooks/settings.hook';
import {
  UpdateProfileFormData,
  updateProfileSchema,
} from '@/schemas/settings.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Input,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

export default function EditDetails() {
  const { user } = useAuth();

  const { mutate: updateProfile, isPending: isUpdatingProfile } =
    useUpdateProfileMutation();

  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  const profileForm = useForm<UpdateProfileFormData>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      firstName: user?.firstName ?? '',
      lastName: user?.lastName ?? '',
      photoURL: undefined,
    },
  });

  const photoURL = profileForm.watch('photoURL');
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (photoURL) {
      const url = URL.createObjectURL(photoURL);
      setImagePreview(url);
      return () => URL.revokeObjectURL(url);
    }
    setImagePreview(null);
  }, [photoURL]);

  useEffect(() => {
    if (user) {
      profileForm.reset({
        firstName: user.firstName ?? '',
        lastName: user.lastName ?? '',
      });
    }
  }, [user, profileForm]);

  function onProfileSubmit(data: UpdateProfileFormData) {
    setProfileError(null);
    setProfileSuccess(null);
    updateProfile(data, {
      onSuccess: () => {
        setProfileSuccess('Profile updated successfully');
        profileForm.reset({ ...data, photoURL: undefined });
      },
      onError: (error) => {
        setProfileError(error.message);
      },
    });
  }

  if (!user) return null;

  const displayPhoto = imagePreview ?? user.photoURL ?? null;

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant='h6' sx={{ mb: 2 }}>
          Edit details
        </Typography>
        <Box
          component='form'
          onSubmit={profileForm.handleSubmit(onProfileSubmit)}
          sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {displayPhoto ? (
              <Avatar
                src={displayPhoto}
                alt='Profile'
                sx={{ width: 80, height: 80 }}
              />
            ) : (
              <Avatar sx={{ width: 80, height: 80 }}>
                {user.firstName?.[0] ?? user.email[0]}
              </Avatar>
            )}
            <Box>
              <Typography variant='body2' color='text.secondary'>
                Profile photo
              </Typography>
              <Controller
                name='photoURL'
                control={profileForm.control}
                render={({ field: { onChange, ref } }) => (
                  <Input
                    inputRef={ref}
                    type='file'
                    inputProps={{
                      accept: 'image/jpeg,image/png,image/webp,image/gif',
                    }}
                    onChange={(e) => {
                      const file = (e.target as HTMLInputElement).files?.[0];
                      onChange(file ?? undefined);
                    }}
                  />
                )}
              />
              {profileForm.formState.errors.photoURL && (
                <Alert severity='error' sx={{ mt: 0.5 }}>
                  {profileForm.formState.errors.photoURL.message}
                </Alert>
              )}
            </Box>
          </Box>
          <TextField
            {...profileForm.register('firstName')}
            label='First name'
            error={!!profileForm.formState.errors.firstName}
            helperText={profileForm.formState.errors.firstName?.message}
            fullWidth
            size='small'
          />
          <TextField
            {...profileForm.register('lastName')}
            label='Last name'
            error={!!profileForm.formState.errors.lastName}
            helperText={profileForm.formState.errors.lastName?.message}
            fullWidth
            size='small'
          />
          {profileError && (
            <Alert severity='error'>
              {profileError.charAt(0).toUpperCase() +
                profileError.slice(1).toLowerCase()}
            </Alert>
          )}
          {profileSuccess && (
            <Alert severity='success'>
              {profileSuccess.charAt(0).toUpperCase() +
                profileSuccess.slice(1).toLowerCase()}
            </Alert>
          )}
          <Button
            type='submit'
            variant='contained'
            disabled={isUpdatingProfile}
            sx={{ alignSelf: 'flex-start', textTransform: 'none' }}
          >
            {isUpdatingProfile ? (
              <CircularProgress size={24} />
            ) : (
              'Save changes'
            )}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}
