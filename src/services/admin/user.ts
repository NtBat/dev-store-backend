import { prisma } from '../../libs/prisma';

type GetUsersFilters = {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
};

export const getAllUsers = async (filters: GetUsersFilters) => {
  const page = filters.page || 1;
  const limit = filters.limit || 20;
  const skip = (page - 1) * limit;

  const where: any = {};

  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: 'insensitive' } },
      { email: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  if (filters.role) {
    where.role = filters.role;
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            orders: true,
            addresses: true,
            favorites: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: limit,
    }),
    prisma.user.count({ where }),
  ]);

  return {
    users,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getUserById = async (id: number) => {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true,
      addresses: {
        select: {
          id: true,
          zipcode: true,
          street: true,
          number: true,
          city: true,
          state: true,
          country: true,
          complement: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
      orders: {
        select: {
          id: true,
          status: true,
          total: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
      favorites: {
        select: {
          id: true,
          productId: true,
          product: {
            select: {
              id: true,
              label: true,
              labelEn: true,
              price: true,
            },
          },
        },
      },
    },
  });

  if (!user) {
    return null;
  }

  const totalSpent = user.orders
    .filter((order) => order.status === 'paid')
    .reduce((sum, order) => sum + order.total, 0);

  const lastOrder = user.orders[0] || null;

  return {
    ...user,
    stats: {
      totalOrders: user.orders.length,
      totalSpent,
      lastOrderDate: lastOrder?.createdAt || null,
    },
  };
};

export const updateUser = async (id: number, data: { name?: string; email?: string }) => {
  return await prisma.user.update({
    where: { id },
    data,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};

export const updateUserRole = async (id: number, role: string) => {
  return await prisma.user.update({
    where: { id },
    data: { role },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  });
};

export const deleteUser = async (id: number) => {
  return await prisma.user.delete({
    where: { id },
  });
};

export const getUsersStats = async () => {
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [totalUsers, newUsersThisMonth, usersWithOrders] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({
      where: {
        createdAt: {
          gte: firstDayOfMonth,
        },
      },
    }),
    prisma.user.count({
      where: {
        orders: {
          some: {},
        },
      },
    }),
  ]);

  return {
    total: totalUsers,
    newThisMonth: newUsersThisMonth,
    activeUsers: usersWithOrders,
  };
};
