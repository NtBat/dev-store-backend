import Stripe from 'stripe';
import { prisma } from '../libs/prisma';
import { CreatePaymentLinkParams } from '../types/payment';
import { getStripeSecretKey } from '../utils/get-stripe-secret-key';
import { getFrontendURL } from '../utils/get-frontend-url';

export const stripe = new Stripe(getStripeSecretKey());

export const createStripeCheckoutSession = async ({
  cart,
  shippingCost,
  orderId,
}: CreatePaymentLinkParams) => {
  const productIds = cart.map((item) => item.productId);
  const products = await prisma.product.findMany({
    where: {
      id: {
        in: productIds,
      },
    },
    select: {
      id: true,
      label: true,
      price: true,
    },
  });

  if (products.length !== productIds.length) {
    throw new Error('Some products were not found');
  }

  const productsMap = new Map(products.map((p) => [p.id, p]));

  const stripeLineItems = cart.map((cartItem) => {
    const product = productsMap.get(cartItem.productId);
    if (!product) {
      throw new Error(`Product ${cartItem.productId} not found`);
    }

    return {
      price_data: {
        product_data: {
          name: product.label,
        },
        currency: 'BRL',
        unit_amount: Math.round(product.price * 100),
      },
      quantity: cartItem.quantity,
    };
  });

  if (shippingCost > 0) {
    stripeLineItems.push({
      price_data: {
        product_data: {
          name: 'Shipping',
        },
        currency: 'BRL',
        unit_amount: Math.round(shippingCost * 100),
      },
      quantity: 1,
    });
  }

  const session = await stripe.checkout.sessions.create({
    line_items: stripeLineItems,
    mode: 'payment',
    metadata: {
      orderId: orderId.toString(),
    },
    success_url: `${getFrontendURL()}/cart/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${getFrontendURL()}/my-orders`,
  });

  return session;
};

export const getConstructEvent = async (rawBody: string, signature: string, webhookKey: string) => {
  try {
    return stripe.webhooks.constructEvent(rawBody, signature, webhookKey);
  } catch {
    return null;
  }
};

export const getStripeCheckoutSession = async (sessionId: string) => {
  try {
    return stripe.checkout.sessions.retrieve(sessionId);
  } catch {
    return null;
  }
};
