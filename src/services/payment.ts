import { createStripeCheckoutSession, getStripeCheckoutSession } from '../libs/stripe';
import { CreatePaymentLinkParams } from '../types/payment';

export const createPaymentLink = async ({
  cart,
  shippingCost,
  orderId,
}: CreatePaymentLinkParams) => {
  try {
    const session = await createStripeCheckoutSession({ cart, shippingCost, orderId });
    if (!session) {
      return null;
    }
    return session.url;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const getOrderIdFromSession = async (sessionId: string) => {
  const session = await getStripeCheckoutSession(sessionId);
  if (!session) {
    return null;
  }

  const orderId = parseInt(session.metadata?.orderId || '0');
  if (isNaN(orderId)) {
    return null;
  }

  return orderId;
};
