import { z } from 'zod';

export const getRevenueChartSchema = z.object({
  period: z.enum(['7days', '30days', '12months']).default('30days'),
});

export const getOrdersChartSchema = z.object({
  period: z.enum(['7days', '30days', '12months']).default('30days'),
});

export const getTopProductsSchema = z.object({
  limit: z.string().optional(),
  period: z.enum(['7days', '30days', 'all']).default('all'),
});
