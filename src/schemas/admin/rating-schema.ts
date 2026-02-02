import { z } from 'zod';

export const getAllRatingsQuerySchema = z.object({
  page: z.string().optional().transform(val => (val ? parseInt(val) : 1)),
  limit: z.string().optional().transform(val => (val ? parseInt(val) : 20)),
  status: z.enum(['pending', 'approved', 'rejected']).optional(),
  productId: z.string().optional().transform(val => (val ? parseInt(val) : undefined)),
  userId: z.string().optional().transform(val => (val ? parseInt(val) : undefined)),
  minRating: z.string().optional().transform(val => (val ? parseInt(val) : undefined)),
  maxRating: z.string().optional().transform(val => (val ? parseInt(val) : undefined)),
});

export const getRatingByIdSchema = z.object({
  id: z.string().transform(val => parseInt(val)),
});

export const updateRatingStatusSchema = z.object({
  approved: z.boolean(),
});
