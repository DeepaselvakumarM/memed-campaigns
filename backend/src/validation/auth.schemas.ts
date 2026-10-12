import { z } from 'zod';
import { USER_ROLES } from '../models/User';
import { pickedOption, requiredText } from './common';

const email = z
  .string({ error: () => 'Email is required.' })
  .trim()
  .toLowerCase()
  .refine((value) => value.length > 0, 'Email is required.')
  .refine(
    (value) => value.length === 0 || z.email().safeParse(value).success,
    'Email must be a valid email address, e.g. name@example.com.',
  );

export const signupSchema = z.object({
  name: requiredText('Name', { min: 2, max: 80 }),
  email,
  // bcrypt only uses the first 72 bytes of a password, so longer ones are rejected rather than silently truncated.
  password: z
    .string({ error: () => 'Password is required.' })
    .refine((value) => value.length > 0, 'Password is required.')
    .refine(
      (value) => value.length === 0 || (value.length >= 8 && value.length <= 72),
      'Password must be between 8 and 72 characters.',
    ),
  role: pickedOption('Account type', USER_ROLES),
});

export const loginSchema = z.object({
  email,
  password: z
    .string({ error: () => 'Password is required.' })
    .refine((value) => value.length > 0, 'Password is required.'),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
