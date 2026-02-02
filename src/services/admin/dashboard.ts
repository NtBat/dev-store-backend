import { prisma } from '../../libs/prisma';

export const getDashboardMetrics = async () => {
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    totalUsers,
    newUsersThisMonth,
    totalOrders,
    ordersByStatus,
    totalRevenue,
    revenueThisMonth,
    averageTicket,
    totalProducts,
    mostViewedProducts,
    mostSoldProducts,
    mostFavoritedProducts,
    recentOrders,
    recentUsers,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({
      where: {
        createdAt: {
          gte: firstDayOfMonth,
        },
      },
    }),
    prisma.order.count(),
    prisma.order.groupBy({
      by: ['status'],
      _count: {
        id: true,
      },
    }),
    prisma.order.aggregate({
      where: {
        status: {
          in: ['paid', 'shipped', 'delivered'],
        },
      },
      _sum: {
        total: true,
      },
    }),
    prisma.order.aggregate({
      where: {
        status: {
          in: ['paid', 'shipped', 'delivered'],
        },
        createdAt: {
          gte: firstDayOfMonth,
        },
      },
      _sum: {
        total: true,
      },
    }),
    prisma.order.aggregate({
      where: {
        status: {
          in: ['paid', 'shipped', 'delivered'],
        },
      },
      _avg: {
        total: true,
      },
    }),
    prisma.product.count(),
    prisma.product.findMany({
      select: {
        id: true,
        label: true,
        labelEn: true,
        viewsCount: true,
        images: {
          take: 1,
          orderBy: { id: 'asc' },
        },
      },
      orderBy: {
        viewsCount: 'desc',
      },
      take: 5,
    }),
    prisma.product.findMany({
      select: {
        id: true,
        label: true,
        labelEn: true,
        salesCount: true,
        images: {
          take: 1,
          orderBy: { id: 'asc' },
        },
      },
      orderBy: {
        salesCount: 'desc',
      },
      take: 5,
    }),
    prisma.product.findMany({
      select: {
        id: true,
        label: true,
        labelEn: true,
        _count: {
          select: {
            favorites: true,
          },
        },
        images: {
          take: 1,
          orderBy: { id: 'asc' },
        },
      },
      orderBy: {
        favorites: {
          _count: 'desc',
        },
      },
      take: 5,
    }),
    prisma.order.findMany({
      select: {
        id: true,
        status: true,
        total: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
    }),
    prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
    }),
  ]);

  const statusMap = ordersByStatus.reduce(
    (acc, item) => {
      acc[item.status] = item._count.id;
      return acc;
    },
    {} as Record<string, number>
  );

  return {
    users: {
      total: totalUsers,
      newThisMonth: newUsersThisMonth,
      activeUsers: totalUsers,
    },
    orders: {
      total: totalOrders,
      pending: statusMap.pending || 0,
      paid: statusMap.paid || 0,
      cancelled: statusMap.cancelled || 0,
      shipped: statusMap.shipped || 0,
      delivered: statusMap.delivered || 0,
      totalRevenue: totalRevenue._sum.total || 0,
      revenueThisMonth: revenueThisMonth._sum.total || 0,
      averageTicket: averageTicket._avg.total || 0,
    },
    products: {
      total: totalProducts,
      mostViewed: mostViewedProducts,
      mostSold: mostSoldProducts,
      mostFavorited: mostFavoritedProducts,
    },
    recentOrders,
    recentUsers,
  };
};

export const getRevenueChart = async (period: string) => {
  const now = new Date();
  let startDate: Date;
  let groupBy: 'day' | 'month';

  if (period === '7days') {
    startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    groupBy = 'day';
  } else if (period === '30days') {
    startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    groupBy = 'day';
  } else {
    startDate = new Date(now.getFullYear() - 1, now.getMonth(), 1);
    groupBy = 'month';
  }

  const orders = await prisma.order.findMany({
    where: {
      status: {
        in: ['paid', 'shipped', 'delivered'],
      },
      createdAt: {
        gte: startDate,
      },
    },
    select: {
      total: true,
      createdAt: true,
    },
  });

  const chartData: { date: string; revenue: number }[] = [];

  if (groupBy === 'day') {
    const days = period === '7days' ? 7 : 30;
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateString = date.toISOString().split('T')[0];

      const dayRevenue = orders
        .filter((order) => {
          const orderDate = new Date(order.createdAt).toISOString().split('T')[0];
          return orderDate === dateString;
        })
        .reduce((sum, order) => sum + order.total, 0);

      chartData.push({
        date: dateString,
        revenue: dayRevenue,
      });
    }
  } else {
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = date.getFullYear();
      const month = date.getMonth();

      const monthRevenue = orders
        .filter((order) => {
          const orderDate = new Date(order.createdAt);
          return orderDate.getFullYear() === year && orderDate.getMonth() === month;
        })
        .reduce((sum, order) => sum + order.total, 0);

      chartData.push({
        date: `${year}-${String(month + 1).padStart(2, '0')}`,
        revenue: monthRevenue,
      });
    }
  }

  return chartData;
};

export const getOrdersChart = async (period: string) => {
  const now = new Date();
  let startDate: Date;
  let groupBy: 'day' | 'month';

  if (period === '7days') {
    startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    groupBy = 'day';
  } else if (period === '30days') {
    startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    groupBy = 'day';
  } else {
    startDate = new Date(now.getFullYear() - 1, now.getMonth(), 1);
    groupBy = 'month';
  }

  const orders = await prisma.order.findMany({
    where: {
      createdAt: {
        gte: startDate,
      },
    },
    select: {
      createdAt: true,
    },
  });

  const chartData: { date: string; orders: number }[] = [];

  if (groupBy === 'day') {
    const days = period === '7days' ? 7 : 30;
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateString = date.toISOString().split('T')[0];

      const dayOrders = orders.filter((order) => {
        const orderDate = new Date(order.createdAt).toISOString().split('T')[0];
        return orderDate === dateString;
      }).length;

      chartData.push({
        date: dateString,
        orders: dayOrders,
      });
    }
  } else {
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = date.getFullYear();
      const month = date.getMonth();

      const monthOrders = orders.filter((order) => {
        const orderDate = new Date(order.createdAt);
        return orderDate.getFullYear() === year && orderDate.getMonth() === month;
      }).length;

      chartData.push({
        date: `${year}-${String(month + 1).padStart(2, '0')}`,
        orders: monthOrders,
      });
    }
  }

  return chartData;
};

export const getTopProducts = async (limit: number, period: string) => {
  let startDate: Date | undefined;

  if (period === '7days') {
    const now = new Date();
    startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  } else if (period === '30days') {
    const now = new Date();
    startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }

  if (startDate) {
    const orderItems = await prisma.orderProduct.groupBy({
      by: ['productId'],
      where: {
        order: {
          createdAt: {
            gte: startDate,
          },
          status: {
            in: ['paid', 'shipped', 'delivered'],
          },
        },
      },
      _sum: {
        quantity: true,
      },
      orderBy: {
        _sum: {
          quantity: 'desc',
        },
      },
      take: limit,
    });

    const productIds = orderItems.map((item) => item.productId);

    const products = await prisma.product.findMany({
      where: {
        id: {
          in: productIds,
        },
      },
      select: {
        id: true,
        label: true,
        labelEn: true,
        price: true,
        salesCount: true,
        images: {
          take: 1,
          orderBy: { id: 'asc' },
        },
      },
    });

    return products.map((product) => ({
      ...product,
      periodSales: orderItems.find((item) => item.productId === product.id)?._sum.quantity || 0,
    }));
  }

  return await prisma.product.findMany({
    where: {
      salesCount: {
        gt: 0,
      },
    },
    select: {
      id: true,
      label: true,
      labelEn: true,
      price: true,
      salesCount: true,
      images: {
        take: 1,
        orderBy: { id: 'asc' },
      },
    },
    orderBy: {
      salesCount: 'desc',
    },
    take: limit,
  });
};
