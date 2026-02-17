import bcrypt from 'bcryptjs';
import { prisma } from '../../libs/prisma';

type CreateUserData = {
  name: string;
  email: string;
  password: string;
  role?: 'customer' | 'admin';
};

export const createUser = async (data: CreateUserData) => {
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email.toLowerCase() },
  });

  if (existingUser) {
    return null;
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);

  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email.toLowerCase(),
      password: hashedPassword,
      role: data.role || 'customer',
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  return user;
};

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

type UpdateUserData = {
  name?: string;
  email?: string;
  password?: string;
  role?: 'customer' | 'admin';
};

export const updateUser = async (id: number, data: UpdateUserData) => {
  const updateData: {
    name?: string;
    email?: string;
    password?: string;
    role?: 'customer' | 'admin';
  } = {};

  if (data.name) updateData.name = data.name;
  if (data.email) updateData.email = data.email.toLowerCase();
  if (data.password) updateData.password = await bcrypt.hash(data.password, 10);
  if (data.role) updateData.role = data.role;

  if (Object.keys(updateData).length === 0) {
    return await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  if (data.email) {
    const emailExists = await prisma.user.findFirst({
      where: { email: data.email!.toLowerCase(), id: { not: id } },
    });
    if (emailExists) {
      const err = new Error('Email already in use') as Error & { code: string };
      err.code = 'EMAIL_TAKEN';
      throw err;
    }
  }

  return await prisma.user.update({
    where: { id },
    data: updateData,
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
