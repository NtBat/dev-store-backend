import { z } from 'zod';

export const addAddressSchema = z.object({
  zipcode: z.string().min(8),
  street: z.string().min(3),
  number: z.string().min(1),
  city: z.string().min(3),
  state: z.string().min(2),
  country: z.string().min(2),
  complement: z.string().optional(),
});
