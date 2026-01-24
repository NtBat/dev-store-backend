import { RequestHandler, Request, Response } from 'express';
import { getCartShippingSchema } from '../schemas/get-cart-shipping-schema';

export const getCartShipping: RequestHandler = async (req: Request, res: Response) => {
  const parseResult = getCartShippingSchema.safeParse(req.query);
  if (!parseResult.success) {
    res.status(400).json({ error: 'Invalid query parameters' });
    return;
  }

  const { zipcode } = parseResult.data; // TODO: Implement shipping logic

  res.json({ error: null, zipcode, cost: 10, days: 3 });
};
