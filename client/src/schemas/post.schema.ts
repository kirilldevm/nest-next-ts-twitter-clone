import z from 'zod';

export const postFormSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Max 200 characters'),
  text: z.string().min(1, 'Text is required').max(2000, 'Max 2000 characters'),
  photoURL: z
    .instanceof(File)
    .optional()
    .refine((file) => !file || file.size <= 5 * 1024 * 1024, 'Max size 5MB')
    .refine(
      (file) =>
        !file ||
        ['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(
          file.type,
        ),
      'Allowed: JPEG, PNG, WebP, GIF',
    ),
});

export type PostFormData = z.infer<typeof postFormSchema>;
