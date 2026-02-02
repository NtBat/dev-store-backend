import { Request, Response } from 'express';
import * as productService from '../../services/admin/product';
import {
  getProductsQuerySchema,
  getProductByIdSchema,
  createProductSchema,
  updateProductSchema,
  addProductImageSchema,
  deleteProductImageSchema,
  addProductVariantSchema,
  updateProductVariantSchema,
  deleteProductVariantSchema,
} from '../../schemas/admin/product-schema';
import { getAbsoluteImageUrl } from '../../utils/get-absolute-image-url';

export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const parseResult = getProductsQuerySchema.safeParse(req.query);

    if (!parseResult.success) {
      return res.status(400).json({ error: 'Invalid query parameters' });
    }

    const { page, limit, categoryId, search, minPrice, maxPrice } = parseResult.data;

    const result = await productService.getAllProducts({
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      categoryId: categoryId ? parseInt(categoryId) : undefined,
      search,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
    });

    const productsWithAbsoluteUrl = result.products.map((product) => ({
      ...product,
      image: product.images[0]
        ? getAbsoluteImageUrl(`media/products/${product.images[0].url}`)
        : null,
      images: undefined,
    }));

    res.json({
      error: null,
      products: productsWithAbsoluteUrl,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error('Error getting all products:', error);
    res.status(500).json({ error: 'Failed to get products' });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const parseResult = getProductByIdSchema.safeParse(req.params);

    if (!parseResult.success) {
      return res.status(400).json({ error: 'Invalid product ID' });
    }

    const { id } = parseResult.data;

    const product = await productService.getProductById(parseInt(id));

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const productWithAbsoluteUrls = {
      ...product,
      images: product.images.map((img) => ({
        ...img,
        url: getAbsoluteImageUrl(`media/products/${img.url}`),
      })),
    };

    res.json({ error: null, product: productWithAbsoluteUrls });
  } catch (error) {
    console.error('Error getting product by ID:', error);
    res.status(500).json({ error: 'Failed to get product' });
  }
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    const parseResult = createProductSchema.safeParse(req.body);

    if (!parseResult.success) {
      return res
        .status(400)
        .json({ error: 'Invalid product data', details: parseResult.error.issues });
    }

    const product = await productService.createProduct(parseResult.data);

    res.status(201).json({ error: null, product });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const paramsResult = getProductByIdSchema.safeParse(req.params);

    if (!paramsResult.success) {
      return res.status(400).json({ error: 'Invalid product ID' });
    }

    const bodyResult = updateProductSchema.safeParse(req.body);

    if (!bodyResult.success) {
      return res
        .status(400)
        .json({ error: 'Invalid product data', details: bodyResult.error.issues });
    }

    const { id } = paramsResult.data;

    const product = await productService.updateProduct(parseInt(id), bodyResult.data);

    res.json({ error: null, product });
  } catch (error: any) {
    console.error('Error updating product:', error);

    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.status(500).json({ error: 'Failed to update product' });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const parseResult = getProductByIdSchema.safeParse(req.params);

    if (!parseResult.success) {
      return res.status(400).json({ error: 'Invalid product ID' });
    }

    const { id } = parseResult.data;

    await productService.deleteProduct(parseInt(id));

    res.json({ error: null, message: 'Product deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting product:', error);

    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.status(500).json({ error: 'Failed to delete product' });
  }
};

export const addProductImage = async (req: Request, res: Response) => {
  try {
    const paramsResult = getProductByIdSchema.safeParse(req.params);

    if (!paramsResult.success) {
      return res.status(400).json({ error: 'Invalid product ID' });
    }

    const bodyResult = addProductImageSchema.safeParse(req.body);

    if (!bodyResult.success) {
      return res
        .status(400)
        .json({ error: 'Invalid image data', details: bodyResult.error.issues });
    }

    const { id } = paramsResult.data;
    const { url } = bodyResult.data;

    const image = await productService.addProductImage(parseInt(id), url);

    res.status(201).json({ error: null, image });
  } catch (error: any) {
    console.error('Error adding product image:', error);

    if (error.code === 'P2003') {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.status(500).json({ error: 'Failed to add product image' });
  }
};

export const deleteProductImage = async (req: Request, res: Response) => {
  try {
    const parseResult = deleteProductImageSchema.safeParse(req.params);

    if (!parseResult.success) {
      return res.status(400).json({ error: 'Invalid image ID' });
    }

    const { imageId } = parseResult.data;

    await productService.deleteProductImage(parseInt(imageId));

    res.json({ error: null, message: 'Image deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting product image:', error);

    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Image not found' });
    }

    res.status(500).json({ error: 'Failed to delete image' });
  }
};

export const addProductVariant = async (req: Request, res: Response) => {
  try {
    const paramsResult = getProductByIdSchema.safeParse(req.params);

    if (!paramsResult.success) {
      return res.status(400).json({ error: 'Invalid product ID' });
    }

    const bodyResult = addProductVariantSchema.safeParse(req.body);

    if (!bodyResult.success) {
      return res
        .status(400)
        .json({ error: 'Invalid variant data', details: bodyResult.error.issues });
    }

    const { id } = paramsResult.data;
    const { size, stock } = bodyResult.data;

    const variant = await productService.addProductVariant(parseInt(id), size, stock);

    res.status(201).json({ error: null, variant });
  } catch (error: any) {
    console.error('Error adding product variant:', error);

    if (error.code === 'P2003') {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Variant with this size already exists' });
    }

    res.status(500).json({ error: 'Failed to add product variant' });
  }
};

export const updateProductVariant = async (req: Request, res: Response) => {
  try {
    const paramsResult = deleteProductVariantSchema.safeParse(req.params);

    if (!paramsResult.success) {
      return res.status(400).json({ error: 'Invalid variant ID' });
    }

    const bodyResult = updateProductVariantSchema.safeParse(req.body);

    if (!bodyResult.success) {
      return res
        .status(400)
        .json({ error: 'Invalid variant data', details: bodyResult.error.issues });
    }

    const { variantId } = paramsResult.data;
    const { stock } = bodyResult.data;

    const variant = await productService.updateProductVariant(parseInt(variantId), stock);

    res.json({ error: null, variant });
  } catch (error: any) {
    console.error('Error updating product variant:', error);

    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Variant not found' });
    }

    res.status(500).json({ error: 'Failed to update variant' });
  }
};

export const deleteProductVariant = async (req: Request, res: Response) => {
  try {
    const parseResult = deleteProductVariantSchema.safeParse(req.params);

    if (!parseResult.success) {
      return res.status(400).json({ error: 'Invalid variant ID' });
    }

    const { variantId } = parseResult.data;

    await productService.deleteProductVariant(parseInt(variantId));

    res.json({ error: null, message: 'Variant deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting product variant:', error);

    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Variant not found' });
    }

    res.status(500).json({ error: 'Failed to delete variant' });
  }
};

export const getProductStats = async (req: Request, res: Response) => {
  try {
    const stats = await productService.getProductStats();

    const topSellingWithImages = stats.topSelling.map((p) => ({
      ...p,
      image: p.images[0] ? getAbsoluteImageUrl(`media/products/${p.images[0].url}`) : null,
      images: undefined,
    }));

    const mostViewedWithImages = stats.mostViewed.map((p) => ({
      ...p,
      image: p.images[0] ? getAbsoluteImageUrl(`media/products/${p.images[0].url}`) : null,
      images: undefined,
    }));

    const mostFavoritedWithImages = stats.mostFavorited.map((p) => ({
      ...p,
      image: p.images[0] ? getAbsoluteImageUrl(`media/products/${p.images[0].url}`) : null,
      images: undefined,
      favoritesCount: p._count.favorites,
      _count: undefined,
    }));

    const outOfStockWithImages = stats.outOfStock.map((p) => ({
      ...p,
      image: p.images[0] ? getAbsoluteImageUrl(`media/products/${p.images[0].url}`) : null,
      images: undefined,
    }));

    res.json({
      error: null,
      stats: {
        totalProducts: stats.totalProducts,
        topSelling: topSellingWithImages,
        mostViewed: mostViewedWithImages,
        mostFavorited: mostFavoritedWithImages,
        outOfStock: outOfStockWithImages,
      },
    });
  } catch (error) {
    console.error('Error getting product stats:', error);
    res.status(500).json({ error: 'Failed to get product stats' });
  }
};
