import { prisma } from '../../libs/prisma';

type GetOrdersFilters = {
  page?: number;
  limit?: number;
  status?: string;
  userId?: number;
  startDate?: Date;
  endDate?: Date;
  minTotal?: number;
  maxTotal?: number;
};

export const getAllOrders = async (filters: GetOrdersFilters) => {
  const page = filters.page || 1;
  const limit = filters.limit || 20;
  const skip = (page - 1) * limit;

  const where: any = {};

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.userId) {
    where.userId = filters.userId;
  }

  if (filters.startDate || filters.endDate) {
    where.createdAt = {};
    if (filters.startDate) {
      where.createdAt.gte = filters.startDate;
    }
    if (filters.endDate) {
      where.createdAt.lte = filters.endDate;
    }
  }

  if (filters.minTotal !== undefined || filters.maxTotal !== undefined) {
    where.total = {};
    if (filters.minTotal !== undefined) {
      where.total.gte = filters.minTotal;
    }
    if (filters.maxTotal !== undefined) {
      where.total.lte = filters.maxTotal;
    }
  }

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      select: {
        id: true,
        userId: true,
        status: true,
        total: true,
        shippingCost: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            orderItems: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: limit,
    }),
    prisma.order.count({ where }),
  ]);

  return {
    orders,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getOrderById = async (id: number) => {
  const order = await prisma.order.findUnique({
    where: { id },
    select: {
      id: true,
      userId: true,
      status: true,
      total: true,
      shippingCost: true,
      shippingDays: true,
      shippingZipcode: true,
      shippingStreet: true,
      shippingNumber: true,
      shippingCity: true,
      shippingState: true,
      shippingCountry: true,
      shippingComplement: true,
      stripeSessionId: true,
      stripePaymentId: true,
      createdAt: true,
      updatedAt: true,
      orderItems: {
        select: {
          id: true,
          quantity: true,
          price: true,
          product: {
            select: {
              id: true,
              label: true,
              labelEn: true,
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
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      statusHistory: {
        select: {
          id: true,
          status: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  });

  if (!order) {
    return null;
  }

  return order;
};
