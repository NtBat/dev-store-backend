import { RequestHandler, Request, Response } from 'express';
import { createCartSchema } from '../schemas/create-cart-schema';
import { createCart as createCartService } from '../services/cart';
import { getAbsoluteImageUrl } from '../utils/get-absolute-image-url';

export const createCart: RequestHandler = async (req: Request, res: Response) => {
  const parseResult = createCartSchema.safeParse(req.body);

  if (!parseResult.success) {
    res.status(400).json({ error: 'Invalid request body' });
    return;
  }

  const { ids } = parseResult.data;

  const cart = await createCartService(ids.map(Number));
  if (!cart) {
    res.status(404).json({ error: 'Cart not found' });
    return;
  }

  const cartWithAbsoluteUrl = cart.map((product) => ({
    ...product,
    image: product.image ? getAbsoluteImageUrl(product.image) : null,
  }));

  res.json({ error: null, cart: cartWithAbsoluteUrl });
};
