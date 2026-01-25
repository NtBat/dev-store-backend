import { RequestHandler, Request, Response } from 'express';
import { getStripeWebhookSecret } from '../utils/get-stripe-webhook-secret';
import { getConstructEvent } from '../libs/stripe';
import Stripe from 'stripe';
import { updateOrderStatus } from '../services/cart';

export const stripe: RequestHandler = async (req: Request, res: Response) => {
  const signature = req.headers['stripe-signature'] as string;
  if (!signature) {
    res.status(400).json({ error: 'Missing Stripe signature' });
    return;
  }

  const webhookKey = getStripeWebhookSecret();
  if (!webhookKey) {
    res.status(400).json({ error: 'Missing Stripe webhook secret' });
    return;
  }

  const rawBody = req.body;

  const event = await getConstructEvent(rawBody, signature, webhookKey);
  if (!event) {
    res.status(400).json({ error: 'Invalid Stripe signature' });
    return;
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const orderId = parseInt(session.metadata?.orderId || '0');
  if (isNaN(orderId)) {
    res.status(400).json({ error: 'Invalid order ID' });
    return;
  }

  switch (event.type) {
    case 'checkout.session.completed':
    case 'checkout.session.async_payment_succeeded':
      await updateOrderStatus(orderId, 'paid');
      break;
    case 'checkout.session.expired':
    case 'checkout.session.async_payment_failed':
    case 'payment_intent.payment_failed':
      await updateOrderStatus(orderId, 'cancelled');
      break;
  }

  res.status(200).json({ error: null });
};
