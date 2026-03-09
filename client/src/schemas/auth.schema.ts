import { z } from 'zod';

export const signupSchema = z
  .object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z
      .string()
      .min(6, 'Confirm password must be at least 6 characters'),
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    profileImage: z
      .union([z.instanceof(FileList), z.instanceof(File)])
      .optional()
      .transform((val) =>
        val instanceof FileList && val.length ? val[0] : val instanceof File ? val : undefined
      )
      .refine((file) => !file || file.size <= 5 * 1024 * 1024, 'Max size 5MB')
      .refine(
        (file) =>
          !file ||
          ['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(
            file.type,
          ),
        'Allowed: JPEG, PNG, WebP, GIF',
      ),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const signinSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type SigninInput = z.infer<typeof signinSchema>;
