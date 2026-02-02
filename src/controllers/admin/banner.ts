import { Request, Response } from 'express';
import * as bannerService from '../../services/admin/banner';
import {
  getBannerByIdSchema,
  createBannerSchema,
  updateBannerSchema,
  reorderBannersSchema,
} from '../../schemas/admin/banner-schema';

export const getAllBanners = async (req: Request, res: Response) => {
  try {
    const banners = await bannerService.getAllBanners();

    res.json({ error: null, banners });
  } catch (error) {
    console.error('Error getting all banners:', error);
    res.status(500).json({ error: 'Failed to get banners' });
  }
};

export const getBannerById = async (req: Request, res: Response) => {
  try {
    const parseResult = getBannerByIdSchema.safeParse(req.params);

    if (!parseResult.success) {
      return res.status(400).json({ error: 'Invalid banner ID' });
    }

    const { id } = parseResult.data;

    const banner = await bannerService.getBannerById(parseInt(id));

    if (!banner) {
      return res.status(404).json({ error: 'Banner not found' });
    }

    res.json({ error: null, banner });
  } catch (error) {
    console.error('Error getting banner by ID:', error);
    res.status(500).json({ error: 'Failed to get banner' });
  }
};

export const createBanner = async (req: Request, res: Response) => {
  try {
    const parseResult = createBannerSchema.safeParse(req.body);

    if (!parseResult.success) {
      return res.status(400).json({ error: 'Invalid request data' });
    }

    const data = parseResult.data;

    const banner = await bannerService.createBanner(data);

    res.json({ error: null, banner });
  } catch (error) {
    console.error('Error creating banner:', error);
    res.status(500).json({ error: 'Failed to create banner' });
  }
};

export const updateBanner = async (req: Request, res: Response) => {
  try {
    const paramsResult = getBannerByIdSchema.safeParse(req.params);
    const bodyResult = updateBannerSchema.safeParse(req.body);

    if (!paramsResult.success || !bodyResult.success) {
      return res.status(400).json({ error: 'Invalid request data' });
    }

    const { id } = paramsResult.data;
    const data = bodyResult.data;

    const banner = await bannerService.updateBanner(parseInt(id), data);

    res.json({ error: null, banner });
  } catch (error: any) {
    console.error('Error updating banner:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Banner not found' });
    }
    res.status(500).json({ error: 'Failed to update banner' });
  }
};

export const deleteBanner = async (req: Request, res: Response) => {
  try {
    const parseResult = getBannerByIdSchema.safeParse(req.params);

    if (!parseResult.success) {
      return res.status(400).json({ error: 'Invalid banner ID' });
    }

    const { id } = parseResult.data;

    await bannerService.deleteBanner(parseInt(id));

    res.json({ error: null, message: 'Banner deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting banner:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Banner not found' });
    }
    res.status(500).json({ error: 'Failed to delete banner' });
  }
};

export const reorderBanners = async (req: Request, res: Response) => {
  try {
    const parseResult = reorderBannersSchema.safeParse(req.body);

    if (!parseResult.success) {
      return res.status(400).json({ error: 'Invalid request data' });
    }

    const { banners } = parseResult.data;

    await bannerService.reorderBanners(banners);

    res.json({ error: null, message: 'Banners reordered successfully' });
  } catch (error) {
    console.error('Error reordering banners:', error);
    res.status(500).json({ error: 'Failed to reorder banners' });
  }
};
