'use client';

import Link from '@/components/link';
import { PAGES } from '@/config/pages.config';
import {
  useCreatePostMutation,
  usePost,
  useUpdatePostMutation,
} from '@/hooks/post.hook';
import { PostFormData, postFormSchema } from '@/schemas/post.schema';
import type { Post } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  IconButton,
  Input,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { RefObject, useEffect, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

type PostFormProps = {
  postId?: string;
};

export default function PostForm({ postId }: PostFormProps) {
  const router = useRouter();
  const isEditMode = !!postId;

  const { data: post, isLoading: isLoadingPost } = usePost(postId);
  const { mutate: createPost, isPending: isCreating } = useCreatePostMutation();
  const { mutate: updatePost, isPending: isUpdating } = useUpdatePostMutation(
    postId ?? '',
  );

  const [formError, setFormError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isPending = isCreating || isUpdating;

  const {
    control,
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PostFormData>({
    resolver: zodResolver(postFormSchema),
    defaultValues: {
      title: '',
      text: '',
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
    if (post) {
      reset({
        title: post.title,
        text: post.text,
        photoURL: undefined,
      });
    }
  }, [post, reset]);

  function onSubmit(data: PostFormData) {
    setFormError(null);
    if (isEditMode && post) {
      updatePost({
        data,
        currentPhotoURL: post.photoURL ?? undefined,
      });
    } else {
      createPost(data);
    }
  }

  function handleClearPhoto() {
    setValue('photoURL', undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  if (isEditMode && isLoadingPost) {
    return (
      <Card>
        <CardContent>
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <CircularProgress />
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (isEditMode && !post) {
    return (
      <Card>
        <CardContent>
          <Alert severity='error'>Post not found</Alert>
          <Box sx={{ mt: 2 }}>
            <Link
              href={PAGES.PROFILE}
              style={{ color: 'inherit', textDecoration: 'underline' }}
            >
              Back to profile
            </Link>
          </Box>
        </CardContent>
      </Card>
    );
  }

  const displayImage =
    imagePreview ?? (post as Post | undefined)?.photoURL ?? null;

  return (
    <Card>
      <CardContent>
        <Typography variant='h6' sx={{ mb: 2 }}>
          {isEditMode ? 'Edit post' : 'Create post'}
        </Typography>

        <Box
          component='form'
          onSubmit={handleSubmit(onSubmit)}
          sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
        >
          <Stack direction='column' gap={2}>
            <Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>
              Photo (optional)
            </Typography>
            {displayImage && (
              <Box
                component='img'
                src={displayImage}
                alt='Post'
                sx={{
                  width: '100%',
                  height: 'auto',
                  maxHeight: 450,
                  objectFit: 'contain',
                  mb: 1,
                  borderRadius: 1,
                }}
              />
            )}
            <Controller
              name='photoURL'
              control={control}
              render={({ field: { onChange, ref } }) => (
                <Input
                  inputRef={(el) => {
                    ref(el);
                    (
                      fileInputRef as RefObject<HTMLInputElement | null>
                    ).current = el;
                  }}
                  type='file'
                  endAdornment={
                    imagePreview && (
                      <IconButton
                        onClick={() => {
                          handleClearPhoto();
                        }}
                      >
                        <DeleteIcon sx={{ color: 'text.secondary' }} />
                      </IconButton>
                    )
                  }
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
          </Stack>

          <TextField
            {...register('title')}
            label='Title'
            error={!!errors.title}
            helperText={errors.title?.message}
            fullWidth
            size='small'
          />
          <TextField
            {...register('text')}
            label='Text'
            error={!!errors.text}
            helperText={errors.text?.message}
            fullWidth
            multiline
            minRows={4}
            size='small'
          />

          {formError && (
            <Alert severity='error'>
              {formError.charAt(0).toUpperCase() + formError.slice(1)}
            </Alert>
          )}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              type='submit'
              variant='contained'
              disabled={isPending}
              sx={{ textTransform: 'none' }}
            >
              {isPending ? (
                <CircularProgress size={24} />
              ) : isEditMode ? (
                'Save changes'
              ) : (
                'Create post'
              )}
            </Button>
            <Button
              variant='outlined'
              sx={{ textTransform: 'none' }}
              onClick={() => router.push(PAGES.PROFILE)}
            >
              Cancel
            </Button>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
