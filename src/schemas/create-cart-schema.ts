import { z } from 'zod';

export const createCartSchema = z.object({
  ids: z.array(z.string().regex(/^\d+$/)).nonempty(),
});

export const finishCartSchema = z.object({
  cart: z
    .array(
      z.object({
        productId: z.number().int().min(1),
        quantity: z.number().int().min(1),
      })
    )
    .nonempty(),
  addressId: z.number().int().min(1),
});
