import { prisma } from '../libs/prisma';
import { Address } from '../types/address';
import { CartItem } from '../types/cart-item';

export const createCart = async (ids: number[]) => {
  const products = await prisma.product.findMany({
    where: {
      id: {
        in: ids,
      },
    },
    select: {
      id: true,
      label: true,
      price: true,
      images: {
        take: 1,
      },
    },
  });

  return products.map((product) => ({
    ...product,
    image: product.images[0].url ? `media/products/${product.images[0].url}` : null,
    images: undefined,
  }));
};

type CreateOrderParams = {
  userId: number;
  address: Address;
  shippingCost: number;
  shippingDays: number;
  cart: CartItem[];
};

export const createOrder = async ({
  userId,
  address,
  shippingCost,
  shippingDays,
  cart,
}: CreateOrderParams) => {
  const productIds = cart.map((item) => item.productId);
  const products = await prisma.product.findMany({
    where: {
      id: {
        in: productIds,
      },
    },
    select: {
      id: true,
      price: true,
    },
  });

  if (products.length !== productIds.length) {
    return null;
  }

  const productsMap = new Map(products.map((p) => [p.id, p]));

  let subtotal = 0;
  const orderItems = cart.map((cartItem) => {
    const product = productsMap.get(cartItem.productId);
    if (!product) {
      throw new Error(`Product ${cartItem.productId} not found`);
    }

    subtotal += product.price * cartItem.quantity;

    return {
      productId: product.id,
      quantity: cartItem.quantity,
      price: product.price,
    };
  });

  const total = subtotal + shippingCost;

  const order = await prisma.order.create({
    data: {
      userId,
      total,
      shippingCost,
      shippingDays,
      shippingZipcode: address.zipcode,
      shippingStreet: address.street,
      shippingNumber: address.number,
      shippingCity: address.city,
      shippingState: address.state,
      shippingCountry: address.country,
      shippingComplement: address.complement,
      orderItems: {
        create: orderItems,
      },
    },
  });

  if (!order) {
    return null;
  }

  return order.id;
};
