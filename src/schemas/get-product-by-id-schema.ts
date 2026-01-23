import z from 'zod';

export const getProductByIdSchema = z.object({
  id: z.string().regex(/^\d+$/),
});
