import { Request, Response } from 'express';
import * as favoriteService from '../services/favorite';
import { getAbsoluteImageUrl } from '../utils/get-absolute-image-url';

/**
 * Add a product to favorites
 */
export const addToFavorites = async (req: Request, res: Response) => {
  try {
    const userId = req.userId as number;
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ error: 'productId is required' });
    }

    await favoriteService.addFavorite(userId, Number(productId));

    res.json({ error: null, message: 'Product added to favorites' });
  } catch (error) {
    console.error('Error adding to favorites:', error);
    res.status(500).json({ error: 'Failed to add to favorites' });
  }
};

/**
 * Remove a product from favorites
 */
export const removeFromFavorites = async (req: Request, res: Response) => {
  try {
    const userId = req.userId as number;
    const { productId } = req.params;

    await favoriteService.removeFavorite(userId, Number(productId));

    res.json({ error: null, message: 'Product removed from favorites' });
  } catch (error) {
    console.error('Error removing from favorites:', error);
    res.status(500).json({ error: 'Failed to remove from favorites' });
  }
};

/**
 * Get user's favorites
 */
export const getUserFavorites = async (req: Request, res: Response) => {
  try {
    const userId = req.userId as number;

    const favorites = await favoriteService.getUserFavorites(userId);

    const favoritesWithAbsoluteUrl = favorites.map((fav) => ({
      id: fav.id,
      productId: fav.productId,
      createdAt: fav.createdAt,
      product: {
        ...fav.product,
        image: fav.product.images[0] ? getAbsoluteImageUrl(fav.product.images[0].url) : null,
      },
    }));

    res.json({ error: null, favorites: favoritesWithAbsoluteUrl });
  } catch (error) {
    console.error('Error getting favorites:', error);
    res.status(500).json({ error: 'Failed to get favorites' });
  }
};

/**
 * Get all favorites grouped by product (Admin only)
 */
export const getAllFavoritesGrouped = async (req: Request, res: Response) => {
  try {
    const favorites = await favoriteService.getAllFavoritesGrouped();

    const favoritesWithAbsoluteUrl = favorites.map((fav) => ({
      product: {
        ...fav.product,
        image: fav.product?.images[0] ? getAbsoluteImageUrl(fav.product.images[0].url) : null,
      },
      count: fav.count,
      users: fav.users,
    }));

    res.json({ error: null, favorites: favoritesWithAbsoluteUrl });
  } catch (error) {
    console.error('Error getting all favorites:', error);
    res.status(500).json({ error: 'Failed to get all favorites' });
  }
};
