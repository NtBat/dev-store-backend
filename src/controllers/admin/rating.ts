import { Request, Response } from 'express';
import * as adminRatingService from '../../services/admin/rating.js';
import {
  getAllRatingsQuerySchema,
  getRatingByIdSchema,
  updateRatingStatusSchema,
} from '../../schemas/admin/rating-schema.js';
import { getProductImageUrl } from '../../utils/get-absolute-image-url.js';

export const getAllRatings = async (req: Request, res: Response) => {
  try {
    const queryResult = getAllRatingsQuerySchema.safeParse(req.query);
    if (!queryResult.success) {
      return res.status(400).json({
        error: 'Invalid query parameters',
        details: queryResult.error.issues,
      });
    }

    const filters = queryResult.data;
    const result = await adminRatingService.getAllRatings(filters);

    const ratingsWithImages = result.ratings.map((rating) => ({
      ...rating,
      product: {
        ...rating.product,
        image: getProductImageUrl(rating.product.images[0]?.url),
        images: undefined,
      },
    }));

    return res.status(200).json({
      error: null,
      ratings: ratingsWithImages,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error('Error fetching ratings:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const getRatingById = async (req: Request, res: Response) => {
  try {
    const paramsResult = getRatingByIdSchema.safeParse(req.params);
    if (!paramsResult.success) {
      return res.status(400).json({
        error: 'Invalid rating ID',
        details: paramsResult.error.issues,
      });
    }

    const { id } = paramsResult.data;
    const rating = await adminRatingService.getRatingById(id);

    if (!rating) {
      return res.status(404).json({ error: 'Rating not found' });
    }

    const ratingWithImage = {
      ...rating,
      product: {
        ...rating.product,
        image: getProductImageUrl(rating.product.images[0]?.url),
        images: undefined,
      },
    };

    return res.status(200).json({
      error: null,
      rating: ratingWithImage,
    });
  } catch (error) {
    console.error('Error fetching rating:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateRatingStatus = async (req: Request, res: Response) => {
  try {
    const paramsResult = getRatingByIdSchema.safeParse(req.params);
    if (!paramsResult.success) {
      return res.status(400).json({
        error: 'Invalid rating ID',
        details: paramsResult.error.issues,
      });
    }

    const bodyResult = updateRatingStatusSchema.safeParse(req.body);
    if (!bodyResult.success) {
      return res.status(400).json({
        error: 'Invalid request body',
        details: bodyResult.error.issues,
      });
    }

    const { id } = paramsResult.data;
    const { approved } = bodyResult.data;

    const updatedRating = await adminRatingService.updateRatingStatus(id, approved);

    return res.status(200).json({
      error: null,
      rating: updatedRating,
      message: `Rating ${approved ? 'approved' : 'rejected'} successfully`,
    });
  } catch (error: any) {
    if (error.message === 'Rating not found') {
      return res.status(404).json({ error: error.message });
    }
    console.error('Error updating rating status:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteRating = async (req: Request, res: Response) => {
  try {
    const paramsResult = getRatingByIdSchema.safeParse(req.params);
    if (!paramsResult.success) {
      return res.status(400).json({
        error: 'Invalid rating ID',
        details: paramsResult.error.issues,
      });
    }

    const { id } = paramsResult.data;

    await adminRatingService.deleteRating(id);

    return res.status(200).json({
      error: null,
      message: 'Rating deleted successfully',
    });
  } catch (error: any) {
    if (error.message === 'Rating not found') {
      return res.status(404).json({ error: error.message });
    }
    console.error('Error deleting rating:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
