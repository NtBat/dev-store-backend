import { z } from 'zod';

export const createRatingSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().optional(),
});

export const getRatingsQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : 1)),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : 10)),
});

export const getProductIdSchema = z.object({
  id: z.string().transform((val) => parseInt(val)),
});
