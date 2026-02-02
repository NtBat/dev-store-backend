import { prisma } from '../../libs/prisma.js';

export const getAllRatings = async (filters: {
  page: number;
  limit: number;
  status?: 'pending' | 'approved' | 'rejected';
  productId?: number;
  userId?: number;
  minRating?: number;
  maxRating?: number;
}) => {
  const { page, limit, status, productId, userId, minRating, maxRating } = filters;
  const skip = (page - 1) * limit;

  const where: any = {};

  if (status === 'pending') {
    where.approved = false;
  } else if (status === 'approved') {
    where.approved = true;
  }

  if (productId) {
    where.productId = productId;
  }

  if (userId) {
    where.userId = userId;
  }

  if (minRating !== undefined || maxRating !== undefined) {
    where.rating = {};
    if (minRating !== undefined) {
      where.rating.gte = minRating;
    }
    if (maxRating !== undefined) {
      where.rating.lte = maxRating;
    }
  }

  const [ratings, total] = await Promise.all([
    prisma.productRating.findMany({
      where,
      select: {
        id: true,
        rating: true,
        comment: true,
        approved: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        product: {
          select: {
            id: true,
            label: true,
            labelEn: true,
            images: {
              select: {
                url: true,
              },
              take: 1,
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: limit,
    }),
    prisma.productRating.count({ where }),
  ]);

  return {
    ratings,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getRatingById = async (id: number) => {
  const rating = await prisma.productRating.findUnique({
    where: { id },
    select: {
      id: true,
      rating: true,
      comment: true,
      approved: true,
      createdAt: true,
      updatedAt: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      product: {
        select: {
          id: true,
          label: true,
          labelEn: true,
          price: true,
          images: {
            select: {
              url: true,
            },
            take: 1,
          },
        },
      },
    },
  });

  return rating;
};

export const updateRatingStatus = async (id: number, approved: boolean) => {
  const rating = await prisma.productRating.findUnique({
    where: { id },
  });

  if (!rating) {
    throw new Error('Rating not found');
  }

  const updatedRating = await prisma.productRating.update({
    where: { id },
    data: { approved },
  });

  return updatedRating;
};

export const deleteRating = async (id: number) => {
  const rating = await prisma.productRating.findUnique({
    where: { id },
  });

  if (!rating) {
    throw new Error('Rating not found');
  }

  await prisma.productRating.delete({
    where: { id },
  });

  return { success: true };
};
