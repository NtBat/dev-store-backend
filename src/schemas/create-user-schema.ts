import { z } from 'zod';

export const createUserSchema = z.object({
  name: z.string().min(3),
  email: z.email().min(10),
  password: z.string().min(8),
});
