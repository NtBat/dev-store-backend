import { RequestHandler, Request, Response } from 'express';
import { getOrderBySessionIdSchema } from '../schemas/get-order-by-session-id-schema';
import { getOrderIdFromSession } from '../services/payment';
import { getOrderById, getUserOrders } from '../services/order';
import { getOrderSchema } from '../schemas/get-order-schema';
import { getAbsoluteImageUrl } from '../utils/get-absolute-image-url';

export const getOrderBySessionId: RequestHandler = async (req: Request, res: Response) => {
  const parseResult = getOrderBySessionIdSchema.safeParse(req.query);
  if (!parseResult.success) {
    res.status(400).json({ error: 'Invalid request query' });
    return;
  }

  const { session_id } = parseResult.data;

  const orderId = await getOrderIdFromSession(session_id);
  if (!orderId) {
    res.status(400).json({ error: 'Invalid session ID' });
    return;
  }

  res.json({ error: null, orderId });
};

export const listOrders: RequestHandler = async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  if (!userId) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const orders = await getUserOrders(userId);
  if (!orders) {
    res.status(500).json({ error: 'Failed to get orders' });
    return;
  }

  res.json({ error: null, orders });
};

export const getOrder: RequestHandler = async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  if (!userId) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const parseResult = getOrderSchema.safeParse(req.params);
  if (!parseResult.success) {
    res.status(400).json({ error: 'Invalid request parameters' });
    return;
  }

  const { id } = parseResult.data;
  const order = await getOrderById(parseInt(id), userId);
  if (!order) {
    res.status(404).json({ error: 'Order not found' });
    return;
  }

  const orderWithAbsoluteImages = {
    ...order,
    orderItems: order.orderItems.map((item) => ({
      ...item,
      product: {
        ...item.product,
        image: item.product.image ? getAbsoluteImageUrl(item.product.image) : null,
      },
    })),
  };

  res.json({ error: null, order: { ...order, orderItems: orderWithAbsoluteImages.orderItems } });
};
