import { RequestHandler, Request, Response } from 'express';
import { getOrderBySessionIdSchema } from '../schemas/get-order-by-session-id-schema';
import { getOrderIdFromSession } from '../services/payment';
import { getUserOrders } from '../services/order';

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
