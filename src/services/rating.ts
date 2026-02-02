import { prisma } from '../libs/prisma.js';

export const createRating = async (
  productId: number,
  userId: number,
  rating: number,
  comment?: string
) => {
  const product = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!product) {
    throw new Error('Product not found');
  }

  const existingRating = await prisma.productRating.findUnique({
    where: {
      productId_userId: {
        productId,
        userId,
      },
    },
  });

  if (existingRating) {
    throw new Error('You have already rated this product');
  }

  const newRating = await prisma.productRating.create({
    data: {
      productId,
      userId,
      rating,
      comment,
      approved: false,
    },
  });

  return newRating;
};

export const getProductRatings = async (productId: number, page: number, limit: number) => {
  const skip = (page - 1) * limit;

  const [ratings, total] = await Promise.all([
    prisma.productRating.findMany({
      where: {
        productId,
        approved: true,
      },
      select: {
        id: true,
        rating: true,
        comment: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: limit,
    }),
    prisma.productRating.count({
      where: {
        productId,
        approved: true,
      },
    }),
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

export const getProductRatingAverage = async (productId: number) => {
  const ratings = await prisma.productRating.findMany({
    where: {
      productId,
      approved: true,
    },
    select: {
      rating: true,
    },
  });

  if (ratings.length === 0) {
    return {
      average: 0,
      count: 0,
    };
  }

  const sum = ratings.reduce((acc, r) => acc + r.rating, 0);
  const average = sum / ratings.length;

  return {
    average: Math.round(average * 10) / 10,
    count: ratings.length,
  };
};
