import { Request, Response } from 'express';
import * as orderService from '../../services/admin/order';
import {
  getOrderByIdSchema,
  getOrdersQuerySchema,
  updateOrderStatusSchema,
} from '../../schemas/admin/order-schema';
import { getAbsoluteImageUrl } from '../../utils/get-absolute-image-url';

export const getAllOrders = async (req: Request, res: Response) => {
  try {
    const parseResult = getOrdersQuerySchema.safeParse(req.query);

    if (!parseResult.success) {
      return res.status(400).json({ error: 'Invalid query parameters' });
    }

    const { page, limit, status, userId, startDate, endDate, minTotal, maxTotal } =
      parseResult.data;

    const result = await orderService.getAllOrders({
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      status,
      userId: userId ? parseInt(userId) : undefined,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      minTotal: minTotal ? parseFloat(minTotal) : undefined,
      maxTotal: maxTotal ? parseFloat(maxTotal) : undefined,
    });

    res.json({
      error: null,
      orders: result.orders,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error('Error getting all orders:', error);
    res.status(500).json({ error: 'Failed to get orders' });
  }
};

export const getOrderById = async (req: Request, res: Response) => {
  try {
    const parseResult = getOrderByIdSchema.safeParse(req.params);

    if (!parseResult.success) {
      return res.status(400).json({ error: 'Invalid order ID' });
    }

    const { id } = parseResult.data;

    const order = await orderService.getOrderById(parseInt(id));

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const orderWithImages = {
      ...order,
      orderItems: order.orderItems.map((item) => ({
        ...item,
        product: {
          ...item.product,
          image: item.product.images[0]
            ? getAbsoluteImageUrl(`media/products/${item.product.images[0].url}`)
            : null,
          images: undefined,
        },
      })),
    };

    res.json({ error: null, order: orderWithImages });
  } catch (error) {
    console.error('Error getting order by ID:', error);
    res.status(500).json({ error: 'Failed to get order by ID' });
  }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const paramsResult = getOrderByIdSchema.safeParse(req.params);

    if (!paramsResult.success) {
      return res.status(400).json({ error: 'Invalid order ID' });
    }

    const bodyResult = updateOrderStatusSchema.safeParse(req.body);

    if (!bodyResult.success) {
      return res.status(400).json({ error: 'Invalid status', details: bodyResult.error.issues });
    }

    const { id } = paramsResult.data;
    const { status } = bodyResult.data;

    const order = await orderService.updateOrderStatus(parseInt(id), status);

    res.json({ error: null, order });
  } catch (error: any) {
    console.error('Error updating order status:', error);

    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.status(500).json({ error: 'Failed to update order status' });
  }
};

export const getOrdersStats = async (req: Request, res: Response) => {
  try {
    const stats = await orderService.getOrdersStats();

    res.json({ error: null, stats });
  } catch (error) {
    console.error('Error getting orders stats:', error);
    res.status(500).json({ error: 'Failed to get orders stats' });
  }
};
