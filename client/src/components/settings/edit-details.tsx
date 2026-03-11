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

  const {
    control,
    handleSubmit,
    reset,
    watch,
    register,
    formState: { errors },
  } = useForm<UpdateProfileFormData>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      firstName: user?.firstName ?? '',
      lastName: user?.lastName ?? '',
      photoURL: undefined,
    },
  });

  const photoURL = watch('photoURL');
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
      reset({
        firstName: user.firstName ?? '',
        lastName: user.lastName ?? '',
      });
    }
  }, [user, reset]);

  function onProfileSubmit(data: UpdateProfileFormData) {
    setProfileError(null);
    setProfileSuccess(null);
    updateProfile(data, {
      onSuccess: () => {
        setProfileSuccess('Profile updated successfully');
        reset({ ...data, photoURL: undefined });
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
          onSubmit={handleSubmit(onProfileSubmit)}
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
                control={control}
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
              {errors.photoURL && (
                <Alert severity='error' sx={{ mt: 0.5 }}>
                  {errors.photoURL.message}
                </Alert>
              )}
            </Box>
          </Box>
          <TextField
            {...register('firstName')}
            label='First name'
            error={!!errors.firstName}
            helperText={errors.firstName?.message}
            fullWidth
            size='small'
          />
          <TextField
            {...register('lastName')}
            label='Last name'
            error={!!errors.lastName}
            helperText={errors.lastName?.message}
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
