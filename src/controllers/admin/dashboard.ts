import { Request, Response } from 'express';
import * as dashboardService from '../../services/admin/dashboard';
import {
  getRevenueChartSchema,
  getOrdersChartSchema,
  getTopProductsSchema,
} from '../../schemas/admin/dashboard-schema';
import { getProductImageUrl } from '../../utils/get-absolute-image-url';

export const getDashboardMetrics = async (req: Request, res: Response) => {
  try {
    const metrics = await dashboardService.getDashboardMetrics();

    const metricsWithImages = {
      ...metrics,
      products: {
        ...metrics.products,
        mostViewed: metrics.products.mostViewed.map((p) => ({
          ...p,
          image: p.images[0] ? getProductImageUrl(p.images[0]?.url) : null,
          images: undefined,
        })),
        mostSold: metrics.products.mostSold.map((p) => ({
          ...p,
          image: p.images[0] ? getProductImageUrl(p.images[0]?.url) : null,
          images: undefined,
        })),
        mostFavorited: metrics.products.mostFavorited.map((p) => ({
          ...p,
          favoritesCount: p._count.favorites,
          _count: undefined,
          image: p.images[0] ? getProductImageUrl(p.images[0]?.url) : null,
          images: undefined,
        })),
      },
    };

    res.json({ error: null, metrics: metricsWithImages });
  } catch (error) {
    console.error('Error getting dashboard metrics:', error);
    res.status(500).json({ error: 'Failed to get dashboard metrics' });
  }
};

export const getRevenueChart = async (req: Request, res: Response) => {
  try {
    const parseResult = getRevenueChartSchema.safeParse(req.query);

    if (!parseResult.success) {
      return res.status(400).json({ error: 'Invalid query parameters' });
    }

    const { period } = parseResult.data;

    const chartData = await dashboardService.getRevenueChart(period);

    res.json({ error: null, data: chartData });
  } catch (error) {
    console.error('Error getting revenue chart:', error);
    res.status(500).json({ error: 'Failed to get revenue chart' });
  }
};

export const getOrdersChart = async (req: Request, res: Response) => {
  try {
    const parseResult = getOrdersChartSchema.safeParse(req.query);

    if (!parseResult.success) {
      return res.status(400).json({ error: 'Invalid query parameters' });
    }

    const { period } = parseResult.data;

    const chartData = await dashboardService.getOrdersChart(period);

    res.json({ error: null, data: chartData });
  } catch (error) {
    console.error('Error getting orders chart:', error);
    res.status(500).json({ error: 'Failed to get orders chart' });
  }
};

export const getTopProducts = async (req: Request, res: Response) => {
  try {
    const parseResult = getTopProductsSchema.safeParse(req.query);

    if (!parseResult.success) {
      return res.status(400).json({ error: 'Invalid query parameters' });
    }

    const { limit, period } = parseResult.data;

    const products = await dashboardService.getTopProducts(limit ? parseInt(limit) : 10, period);

    const productsWithImages = products.map((p: any) => ({
      ...p,
      image: p.images[0] ? getProductImageUrl(p.images[0]?.url) : null,
      images: undefined,
    }));

    res.json({ error: null, products: productsWithImages });
  } catch (error) {
    console.error('Error getting top products:', error);
    res.status(500).json({ error: 'Failed to get top products' });
  }
};
