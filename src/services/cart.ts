import { prisma } from '../libs/prisma';

export const createCart = async (ids: number[]) => {
  const products = await prisma.product.findMany({
    where: {
      id: {
        in: ids,
      },
    },
    select: {
      id: true,
      label: true,
      price: true,
      images: {
        take: 1,
      },
    },
  });

  return products.map((product) => ({
    ...product,
    image: product.images[0].url ? `media/products/${product.images[0].url}` : null,
    images: undefined,
  }));
};
