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
    profileImageUrl: z
      .union([
        z.string().url('Profile image must be a valid URL'),
        z.literal(''),
      ])
      .optional()
      .transform((val) => (val === '' || !val ? undefined : val)),
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

/** Clean signup data for API - empty profileImageUrl becomes undefined */
export function signupToApi(data: SignupInput) {
  return {
    ...data,
    profileImageUrl: data.profileImageUrl?.trim() || undefined,
  };
}
