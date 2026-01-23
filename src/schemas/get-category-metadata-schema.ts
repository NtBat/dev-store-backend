import z from 'zod';

export const getCategoryMetadataSchema = z.object({
  slug: z.string(),
});
