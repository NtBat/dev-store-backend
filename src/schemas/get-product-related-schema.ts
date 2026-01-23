import z from 'zod';

export const getProductRelatedSchema = z.object({
  id: z.string().regex(/^\d+$/),
});
