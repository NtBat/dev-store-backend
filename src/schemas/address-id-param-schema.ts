import { z } from 'zod';

export const addressIdParamSchema = z.object({
  id: z.string().regex(/^\d+$/, { message: 'Address ID must be a valid number' }),
});
