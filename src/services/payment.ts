import { createStripeCheckoutSession } from '../libs/stripe';
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
