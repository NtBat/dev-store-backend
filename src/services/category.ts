import { prisma } from '../libs/prisma';

export const getCategory = async (id: number) => {
  const category = await prisma.category.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      slug: true,
    },
  });

  return category;
};
