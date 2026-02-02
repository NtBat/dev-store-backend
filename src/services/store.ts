import { prisma } from '../libs/prisma';

export const getStoreInfo = async () => {
  const store = await prisma.store.findFirst({
    include: {
      features: {
        orderBy: { order: 'asc' },
      },
    },
  });

  return store;
};

export const updateStoreInfo = async (data: {
  topbarText?: string;
  topbarTextEn?: string;
  instagram?: string;
  facebook?: string;
  email?: string;
  whatsapp?: string;
  copyright?: string;
  copyrightEn?: string;
}) => {
  const existingStore = await prisma.store.findFirst();

  if (!existingStore) {
    return await prisma.store.create({
      data,
    });
  }

  return await prisma.store.update({
    where: { id: existingStore.id },
    data,
  });
};

export const createStoreBenefit = async (data: {
  iconName: string;
  title: string;
  titleEn?: string;
  description: string;
  descriptionEn?: string;
  order?: number;
}) => {
  const store = await prisma.store.findFirst();

  if (!store) {
    throw new Error('Store not found. Please create store info first.');
  }

  return await prisma.storeBenefit.create({
    data: {
      ...data,
      storeId: store.id,
    },
  });
};

export const updateStoreBenefit = async (
  id: number,
  data: {
    iconName?: string;
    title?: string;
    titleEn?: string;
    description?: string;
    descriptionEn?: string;
    order?: number;
  }
) => {
  return await prisma.storeBenefit.update({
    where: { id },
    data,
  });
};

export const deleteStoreBenefit = async (id: number) => {
  return await prisma.storeBenefit.delete({
    where: { id },
  });
};
