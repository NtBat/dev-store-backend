import { Request, Response } from 'express';
import * as ratingService from '../services/rating.js';
import {
  createRatingSchema,
  getRatingsQuerySchema,
  getProductIdSchema,
} from '../schemas/rating-schema.js';

export const createRating = async (req: Request, res: Response) => {
  try {
    const paramsResult = getProductIdSchema.safeParse(req.params);
    if (!paramsResult.success) {
      return res.status(400).json({
        error: 'Invalid product ID',
        details: paramsResult.error.issues,
      });
    }

    const bodyResult = createRatingSchema.safeParse(req.body);
    if (!bodyResult.success) {
      return res.status(400).json({
        error: 'Invalid request body',
        details: bodyResult.error.issues,
      });
    }

    const { id: productId } = paramsResult.data;
    const { rating, comment } = bodyResult.data;
    const userId = (req as any).userId as number;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const newRating = await ratingService.createRating(productId, userId, rating, comment);

    return res.status(201).json({
      error: null,
      rating: newRating,
      message: 'Rating submitted successfully. It will be visible after admin approval.',
    });
  } catch (error: any) {
    if (error.message === 'Product not found') {
      return res.status(404).json({ error: error.message });
    }
    if (error.message === 'You have already rated this product') {
      return res.status(400).json({ error: error.message });
    }
    console.error('Error creating rating:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const getProductRatings = async (req: Request, res: Response) => {
  try {
    const paramsResult = getProductIdSchema.safeParse(req.params);
    if (!paramsResult.success) {
      return res.status(400).json({
        error: 'Invalid product ID',
        details: paramsResult.error.issues,
      });
    }

    const queryResult = getRatingsQuerySchema.safeParse(req.query);
    if (!queryResult.success) {
      return res.status(400).json({
        error: 'Invalid query parameters',
        details: queryResult.error.issues,
      });
    }

    const { id: productId } = paramsResult.data;
    const { page, limit } = queryResult.data;

    const result = await ratingService.getProductRatings(productId, page, limit);

    return res.status(200).json({
      error: null,
      ...result,
    });
  } catch (error) {
    console.error('Error fetching ratings:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const getProductRatingAverage = async (req: Request, res: Response) => {
  try {
    const paramsResult = getProductIdSchema.safeParse(req.params);
    if (!paramsResult.success) {
      return res.status(400).json({
        error: 'Invalid product ID',
        details: paramsResult.error.issues,
      });
    }

    const { id: productId } = paramsResult.data;

    const result = await ratingService.getProductRatingAverage(productId);

    return res.status(200).json({
      error: null,
      ...result,
    });
  } catch (error) {
    console.error('Error fetching rating average:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
