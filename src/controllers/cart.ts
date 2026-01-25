import { RequestHandler, Request, Response } from 'express';
import { createCartSchema, finishCartSchema } from '../schemas/create-cart-schema';
import { createCart as createCartService, createOrder } from '../services/cart';
import { getAbsoluteImageUrl } from '../utils/get-absolute-image-url';
import { getUserAddressById } from '../services/user';
import { createPaymentLink } from '../services/payment';

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

export const finishCart: RequestHandler = async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  if (!userId) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const parseResult = finishCartSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({ error: 'Invalid request body' });
    return;
  }

  const { cart, addressId } = parseResult.data;

  const userAddress = await getUserAddressById(userId, addressId);
  if (!userAddress) {
    res.status(404).json({ error: 'Address not found' });
    return;
  }

  const shippingCost = 7; // TODO: Implement shipping cost logic
  const shippingDays = 3; // TODO: Implement shipping days logic

  const orderId = await createOrder({
    userId,
    address: userAddress,
    shippingCost,
    shippingDays,
    cart,
  });

  if (!orderId) {
    res.status(500).json({ error: 'Failed to create order' });
    return;
  }

  const url = await createPaymentLink({
    cart,
    shippingCost,
    orderId,
  });

  if (!url) {
    res.status(500).json({ error: 'Failed to create payment link' });
    return;
  }

  res.status(201).json({ error: null, url });
};
