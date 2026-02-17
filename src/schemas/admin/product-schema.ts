import { z } from 'zod';

export const getProductsQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  categoryId: z.string().optional(),
  search: z.string().optional(),
  minPrice: z.string().optional(),
  maxPrice: z.string().optional(),
});

export const getProductByIdSchema = z.object({
  id: z.string(),
});

export const createProductSchema = z.object({
  label: z.string().min(1, 'Label is required'),
  labelEn: z.string().optional(),
  price: z.number().positive('Price must be positive'),
  description: z.string().optional(),
  descriptionEn: z.string().optional(),
  categoryId: z.number().int().positive('Category ID is required'),
});

const variantUpdateSchema = z.object({
  id: z.coerce.number().int().positive().optional(),
  size: z.string().min(1, 'Size is required'),
  stock: z.number().int().min(0, 'Stock must be non-negative'),
});

const imageUpdateSchema = z.object({
  id: z.coerce.number().int().positive().optional(),
  url: z.string().min(1, 'Image URL is required'),
});

export const updateProductSchema = z.object({
  label: z.string().min(1).optional(),
  labelEn: z.string().optional(),
  price: z.number().positive().optional(),
  description: z.string().optional(),
  descriptionEn: z.string().optional(),
  categoryId: z.number().int().positive().optional(),
  variants: z.array(variantUpdateSchema).optional(),
  images: z.array(imageUpdateSchema).optional(),
});

export const addProductImageSchema = z.object({
  url: z.string().min(1, 'Image URL is required'),
});

export const deleteProductImageSchema = z.object({
  imageId: z.string(),
});

export const addProductVariantSchema = z.object({
  size: z.string().min(1, 'Size is required'),
  stock: z.number().int().min(0, 'Stock must be non-negative'),
});

export const updateProductVariantSchema = z.object({
  stock: z.number().int().min(0, 'Stock must be non-negative'),
});

export const deleteProductVariantSchema = z.object({
  variantId: z.string(),
});
