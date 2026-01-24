import { z } from 'zod';

export const getCartShippingSchema = z.object({
  zipcode: z.string().min(8).max(8),
});
