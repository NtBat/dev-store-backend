import { prisma } from '../libs/prisma';

export const getUserOrders = async (userId: number) => {
  return await prisma.order.findMany({
    where: { userId },
    select: {
      id: true,
      status: true,
      total: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });
};

export const getOrderById = async (id: number, userId: number) => {
  const order = await prisma.order.findFirst({
    where: { id, userId },
    select: {
      id: true,
      status: true,
      total: true,
      createdAt: true,
      shippingCost: true,
      shippingDays: true,
      shippingCity: true,
      shippingState: true,
      shippingCountry: true,
      shippingComplement: true,
      shippingNumber: true,
      shippingStreet: true,
      shippingZipcode: true,
      orderItems: {
        select: {
          id: true,
          quantity: true,
          price: true,
          product: {
            select: {
              id: true,
              label: true,
              price: true,
              images: {
                take: 1,
                orderBy: {
                  id: 'asc',
                },
              },
            },
          },
        },
      },
    },
  });

  if (!order) {
    return null;
  }

  return {
    ...order,
    orderItems: order.orderItems.map((item) => {
      const rawUrl = item.product.images[0]?.url;
      const imagePath = rawUrl
        ? rawUrl.startsWith('http://') || rawUrl.startsWith('https://')
          ? rawUrl
          : `media/products/${rawUrl}`
        : null;
      return {
        ...item,
        product: {
          ...item.product,
          image: imagePath,
          images: undefined,
        },
      };
    }),
  };
};
