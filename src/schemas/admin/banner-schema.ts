import { z } from 'zod';

export const getBannersQuerySchema = z.object({
  limit: z.string().optional(),
});

export const getBannerByIdSchema = z.object({
  id: z.string(),
});

export const createBannerSchema = z.object({
  img: z.string(),
  link: z.string(),
  order: z.number().optional(),
});

export const updateBannerSchema = z.object({
  img: z.string().optional(),
  link: z.string().optional(),
  order: z.number().optional(),
});

export const reorderBannersSchema = z.object({
  banners: z.array(
    z.object({
      id: z.number(),
      order: z.number(),
    })
  ),
});
