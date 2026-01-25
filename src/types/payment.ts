import { CartItem } from '../types/cart-item';

export type CreatePaymentLinkParams = {
  cart: CartItem[];
  shippingCost: number;
  orderId: number;
};
