/**
 * Sign In Form Schema
 * FSD Layer: Features
 */

import { z } from 'zod';

export const signInSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});

export type SignInFormData = z.infer<typeof signInSchema>;
