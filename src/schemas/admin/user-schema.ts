import { z } from 'zod';

export const createUserSchema = z.object({
  name: z.string().min(3, { message: 'Name must be at least 3 characters' }),
  email: z.string().email().min(6, { message: 'Invalid or too short email' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters' }),
  role: z.enum(['customer', 'admin']).optional().default('customer'),
});

export const getUsersQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  search: z.string().optional(),
  role: z.enum(['customer', 'admin']).optional(),
});

export const getUserByIdSchema = z.object({
  id: z.string(),
});

export const updateUserSchema = z
  .object({
    name: z.string().min(3, { message: 'Name must be at least 3 characters' }).optional(),
    email: z.string().email().min(6, { message: 'Invalid or too short email' }).optional(),
    password: z.string().min(8, { message: 'Password must be at least 8 characters' }).optional(),
    confirmPassword: z.string().optional(),
    role: z.enum(['customer', 'admin']).optional(),
  })
  .refine(
    (data) => {
      if (data.password && !data.confirmPassword) return false;
      if (!data.password && data.confirmPassword) return false;
      if (data.password && data.confirmPassword && data.password !== data.confirmPassword)
        return false;
      return true;
    },
    { message: 'Password and confirmation must match', path: ['confirmPassword'] }
  )
  .refine(
    (data) => data.name || data.email || data.password || data.role !== undefined,
    {
      message: 'At least one field (name, email, password, or role) must be provided',
      path: ['name'],
    }
  );
