import { z } from 'zod';

export const createUserSchema = z.object({
  name: z.string().min(3),
  email: z.email().min(6),
  password: z.string().min(8),
});

export const loginUserSchema = z.object({
  email: z.email().min(6),
  password: z.string().min(8),
});
