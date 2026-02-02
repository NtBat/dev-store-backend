import { z } from 'zod';

export const getUsersQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  search: z.string().optional(),
  role: z.enum(['customer', 'admin']).optional(),
});

export const getUserByIdSchema = z.object({
  id: z.string(),
});

export const updateUserSchema = z.object({
  name: z.string().optional(),
  email: z.email().optional(),
});

export const updateUserRoleSchema = z.object({
  role: z.enum(['customer', 'admin']),
});
