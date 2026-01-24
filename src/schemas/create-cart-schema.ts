import { z } from 'zod';

export const createCartSchema = z.object({
  ids: z.array(z.string().regex(/^\d+$/)).nonempty(),
});
