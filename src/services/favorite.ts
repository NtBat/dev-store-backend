import { prisma } from '../libs/prisma';

export const addFavorite = async (userId: number, productId: number) => {
  return await prisma.favorite.create({
    data: {
      userId,
      productId,
    },
  });
};

export const removeFavorite = async (userId: number, productId: number) => {
  return await prisma.favorite.deleteMany({
    where: {
      userId,
      productId,
    },
  });
};

export const getUserFavorites = async (userId: number) => {
  return await prisma.favorite.findMany({
    where: {
      userId,
    },
    select: {
      id: true,
      productId: true,
      createdAt: true,
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
    orderBy: {
      createdAt: 'desc',
    },
  });
};

export const isFavorited = async (userId: number, productId: number) => {
  const favorite = await prisma.favorite.findFirst({
    where: {
      userId,
      productId,
    },
  });

  return !!favorite;
};

export const checkMultipleFavorites = async (userId: number, productIds: number[]) => {
  const favorites = await prisma.favorite.findMany({
    where: {
      userId,
      productId: {
        in: productIds,
      },
    },
    select: {
      productId: true,
    },
  });

  const favoritedIds = new Set(favorites.map((f) => f.productId));
  return productIds.map((id) => favoritedIds.has(id));
};

export const getAllFavoritesGrouped = async () => {
  const favorites = await prisma.favorite.groupBy({
    by: ['productId'],
    _count: {
      productId: true,
    },
    orderBy: {
      _count: {
        productId: 'desc',
      },
    },
  });

  const favoritesWithDetails = await Promise.all(
    favorites.map(async (fav) => {
      const product = await prisma.product.findUnique({
        where: {
          id: fav.productId,
        },
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
      });

      const users = await prisma.favorite.findMany({
        where: {
          productId: fav.productId,
        },
        select: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      return {
        product,
        count: fav._count.productId,
        users: users.map((u) => u.user),
      };
    })
  );

  return favoritesWithDetails;
};
