import { prisma } from '../libs/prisma';

type ProductFilters = {
  metadata?: { [key: string]: string };
  order?: 'views' | 'selling' | 'price';
  limit?: number;
  categorySlug?: string;
  userId?: number;
};

export const getAllProducts = async (filters: ProductFilters) => {
  let orderBy = {};
  switch (filters.order) {
    case 'views':
    default:
      orderBy = { viewsCount: 'desc' };
      break;
    case 'selling':
      orderBy = { salesCount: 'desc' };
      break;
    case 'price':
      orderBy = { price: 'asc' };
      break;
  }

  let where: any = {};
  if (filters.metadata && typeof filters.metadata === 'object') {
    let metaFilters = [];
    for (let categoryMetadataId in filters.metadata) {
      const value = filters.metadata[categoryMetadataId];
      if (typeof value !== 'string') continue;

      const valuesIds = value
        .split('|')
        .map((v: string) => v.trim())
        .filter(Boolean);

      if (valuesIds.length === 0) continue;

      metaFilters.push({
        metadata: {
          some: {
            categoryMetadataId,
            metadataValueId: {
              in: valuesIds,
            },
          },
        },
      });
    }

    if (metaFilters.length > 0) {
      where = {
        AND: metaFilters,
      };
    }
  }

  if (filters.categorySlug) {
    where.category = {
      slug: filters.categorySlug,
    };
  }

  const products = await prisma.product.findMany({
    select: {
      id: true,
      label: true,
      labelEn: true,
      price: true,
      images: {
        take: 1,
        orderBy: {
          id: 'desc',
        },
      },
    },
    where,
    orderBy,
    take: filters.limit ?? undefined,
  });

  let favoritedProductIds = new Set<number>();
  if (filters.userId) {
    const favorites = await prisma.favorite.findMany({
      where: {
        userId: filters.userId,
        productId: {
          in: products.map((p) => p.id),
        },
      },
      select: {
        productId: true,
      },
    });
    favoritedProductIds = new Set(favorites.map((f) => f.productId));
  }

  const ratingsData = await prisma.productRating.groupBy({
    by: ['productId'],
    where: {
      productId: {
        in: products.map((p) => p.id),
      },
      approved: true,
    },
    _avg: {
      rating: true,
    },
    _count: {
      rating: true,
    },
  });

  const ratingsMap = new Map(
    ratingsData.map((r) => [
      r.productId,
      {
        average: r._avg.rating ? Math.round(r._avg.rating * 10) / 10 : 0,
        count: r._count.rating,
      },
    ])
  );

  return products.map((product) => ({
    ...product,
    image: product.images[0]?.url || null,
    images: undefined,
    liked: favoritedProductIds.has(product.id),
    ratingAverage: ratingsMap.get(product.id)?.average ?? 0,
    ratingCount: ratingsMap.get(product.id)?.count ?? 0,
  }));
};

export const getProduct = async (id: number, userId?: number) => {
  const product = await prisma.product.findUnique({
    where: { id },
    select: {
      id: true,
      label: true,
      labelEn: true,
      price: true,
      description: true,
      descriptionEn: true,
      categoryId: true,
      images: true,
    },
  });

  if (!product) {
    return null;
  }

  let liked = false;
  if (userId) {
    const favorite = await prisma.favorite.findFirst({
      where: {
        userId,
        productId: id,
      },
    });
    liked = !!favorite;
  }

  const approvedRatings = await prisma.productRating.findMany({
    where: {
      productId: id,
      approved: true,
    },
    select: {
      rating: true,
    },
  });

  let ratingAverage = 0;
  if (approvedRatings.length > 0) {
    const sum = approvedRatings.reduce((acc, r) => acc + r.rating, 0);
    ratingAverage = Math.round((sum / approvedRatings.length) * 10) / 10;
  }

  return {
    ...product,
    images: product.images.length > 0 ? product.images.map((image) => image.url) : [],
    liked,
    ratingAverage,
    ratingCount: approvedRatings.length,
  };
};

export const incrementProductView = async (id: number) => {
  await prisma.product.update({
    where: { id },
    data: {
      viewsCount: {
        increment: 1,
      },
    },
  });
};

export const getProductsFromSameCategory = async (
  id: number,
  userId?: number,
  limit: number = 4
) => {
  const product = await prisma.product.findUnique({
    where: { id },
    select: {
      categoryId: true,
    },
  });

  if (!product) {
    return null;
  }

  const products = await prisma.product.findMany({
    where: { categoryId: product.categoryId, id: { not: id } },
    select: {
      id: true,
      label: true,
      labelEn: true,
      price: true,
      images: {
        take: 1,
        orderBy: {
          id: 'desc',
        },
      },
    },
    take: limit,
    orderBy: {
      viewsCount: 'desc',
    },
  });

  let favoritedProductIds = new Set<number>();
  if (userId) {
    const favorites = await prisma.favorite.findMany({
      where: {
        userId,
        productId: {
          in: products.map((p) => p.id),
        },
      },
      select: {
        productId: true,
      },
    });
    favoritedProductIds = new Set(favorites.map((f) => f.productId));
  }

  const ratingsData = await prisma.productRating.groupBy({
    by: ['productId'],
    where: {
      productId: {
        in: products.map((p) => p.id),
      },
      approved: true,
    },
    _avg: {
      rating: true,
    },
    _count: {
      rating: true,
    },
  });

  const ratingsMap = new Map(
    ratingsData.map((r) => [
      r.productId,
      {
        average: r._avg.rating ? Math.round(r._avg.rating * 10) / 10 : 0,
        count: r._count.rating,
      },
    ])
  );

  return products.map((product) => ({
    ...product,
    image: product.images[0]?.url || null,
    images: undefined,
    liked: favoritedProductIds.has(product.id),
    ratingAverage: ratingsMap.get(product.id)?.average ?? 0,
    ratingCount: ratingsMap.get(product.id)?.count ?? 0,
  }));
};
