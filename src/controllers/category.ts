import { Request, RequestHandler, Response } from 'express';
import { getCategoryMetadataSchema } from '../schemas/get-category-metadata-schema';
import { getCategoryBySlug, getCategoryMetadata } from '../services/category';

export const getCategoryWithMetadata: RequestHandler = async (req: Request, res: Response) => {
  const paramsResult = getCategoryMetadataSchema.safeParse(req.params);
  if (!paramsResult.success) {
    res.status(400).json({ error: 'Invalid query parameters' });
    return;
  }

  const { slug } = paramsResult.data;
  const category = await getCategoryBySlug(slug);
  if (!category) {
    res.status(404).json({ error: 'Category not found' });
    return;
  }

  const metadata = await getCategoryMetadata(category.id);

  res.json({ error: null, category, metadata });
};
