import { z } from 'zod';

export const getOrdersQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  status: z.enum(['pending', 'paid', 'cancelled', 'shipped', 'delivered']).optional(),
  userId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  minTotal: z.string().optional(),
  maxTotal: z.string().optional(),
});

export const getOrderByIdSchema = z.object({
  id: z.string(),
});
