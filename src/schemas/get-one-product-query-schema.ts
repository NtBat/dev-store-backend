import z from 'zod';

export const getProductRelatedQuerySchema = z.object({
  limit: z.string().regex(/^\d+$/).optional(),
});
