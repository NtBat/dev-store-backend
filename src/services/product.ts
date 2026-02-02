import { prisma } from '../libs/prisma';

type ProductFilters = {
  metadata?: { [key: string]: string };
  order?: 'views' | 'selling' | 'price';
  limit?: number;
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

  let where = {};
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

  const products = await prisma.product.findMany({
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

  return products.map((product) => ({
    ...product,
    image: product.images[0].url ? `media/products/${product.images[0].url}` : null,
    images: undefined,
    liked: favoritedProductIds.has(product.id),
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

  return {
    ...product,
    images:
      product.images.length > 0 ? product.images.map((image) => `media/products/${image.url}`) : [],
    liked,
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
          id: 'asc',
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

  return products.map((product) => ({
    ...product,
    image: product.images[0].url ? `media/products/${product.images[0].url}` : null,
    images: undefined,
    liked: favoritedProductIds.has(product.id),
  }));
};
