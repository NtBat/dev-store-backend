import { Request, RequestHandler, Response } from 'express';
import { getProductSchema } from '../schemas/get-product-schema';
import { getProductByIdSchema } from '../schemas/get-product-by-id-schema';
import {
  getAllProducts,
  getProduct,
  incrementProductView,
  getProductsFromSameCategory,
} from '../services/product';
import { getAbsoluteImageUrl } from '../utils/get-absolute-image-url';
import { getCategory } from '../services/category';
import { getProductRelatedSchema } from '../schemas/get-product-related-schema';
import { getProductRelatedQuerySchema } from '../schemas/get-one-product-query-schema';

export const getProducts: RequestHandler = async (req: Request, res: Response) => {
  const parseResult = getProductSchema.safeParse(req.query);

  if (!parseResult.success) {
    res.status(400).json({ error: 'Invalid query parameters' });
    return;
  }

  const { metadata, orderBy, limit, categorySlug } = parseResult.data;

  const parsedLimit = limit ? parseInt(limit) : undefined;
  
  let parsedMetadata: { [key: string]: string } | undefined;
  if (metadata) {
    try {
      parsedMetadata = JSON.parse(metadata);
    } catch {
      parsedMetadata = undefined;
    }
  }

  if (!parsedMetadata && req.query.metadata && typeof req.query.metadata === 'object') {
    parsedMetadata = req.query.metadata as { [key: string]: string };
  }

  const userId = (req as any).userId;

  const products = await getAllProducts({
    metadata: parsedMetadata,
    order: orderBy,
    limit: parsedLimit,
    categorySlug,
    userId,
  });

  res.json({ error: null, products });
};

export const getProductById: RequestHandler = async (req: Request, res: Response) => {
  const paramsResult = getProductByIdSchema.safeParse(req.params);
  if (!paramsResult.success) {
    res.status(400).json({ error: 'Invalid query parameters' });
    return;
  }

  const { id } = paramsResult.data;

  const userId = (req as any).userId;

  const product = await getProduct(parseInt(id), userId);
  if (!product) {
    res.json({ error: 'Product not found' });
    return;
  }

  const category = await getCategory(product.categoryId);

  await incrementProductView(product.id);

  res.json({ error: null, product, category });
};

export const getProductRelated: RequestHandler = async (req: Request, res: Response) => {
  const paramsResult = getProductRelatedSchema.safeParse(req.params);
  const queryResult = getProductRelatedQuerySchema.safeParse(req.query);

  if (!paramsResult.success || !queryResult.success) {
    res.status(400).json({ error: 'Invalid query parameters' });
    return;
  }

  const { id } = paramsResult.data;
  const { limit } = queryResult.data;

  const userId = (req as any).userId;

  const products = await getProductsFromSameCategory(
    parseInt(id),
    userId,
    limit ? parseInt(limit) : 4
  );
  if (!products) {
    res.status(404).json({ error: 'Products not found' });
    return;
  }

  res.json({ error: null, products });
};
